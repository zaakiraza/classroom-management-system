import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import {
  enrollments,
  notifications,
  quizAttempts,
  quizOptions,
  quizQuestions,
  quizzes,
  rooms,
  users,
} from "../../db/schema";
import type { RoomRow } from "../rooms/rooms.schemas";
import type { Role } from "../users/users.schemas";
import {
  type AttemptAnswer,
  type CreateQuizInput,
  type LoadedQuestion,
  type PerQuestionResult,
  type QuizAttemptView,
  type QuizQuestionInput,
  type QuizResponse,
  type QuizResultsResponse,
  type QuizRow,
  type SaveAttemptInput,
  type SaveAttemptResponse,
  type UpdateQuizInput,
} from "./quizzes.schemas";

/** The transaction handle passed to `db.transaction` callbacks. */
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

const NO_ACCESS = "You do not have access to this page.";

@Injectable()
export class QuizzesService {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** STORY-011/013: admins and the owning teacher see every quiz; students only published ones. */
  list(caller: AuthUser, roomId: string): QuizResponse[] {
    const room = this.getRoom(roomId);
    const role = this.roleOf(caller.id);
    const mayView =
      role === "admin" ||
      (role === "teacher" && room.ownerTeacherId === caller.id) ||
      (role === "student" && this.isActivelyEnrolled(roomId, caller.id));
    if (!mayView) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    return this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.roomId, roomId))
      .orderBy(asc(quizzes.createdAt))
      .all()
      .filter((quiz) => role !== "student" || quiz.publishedAt !== null)
      .map((quiz) => this.toQuizResponse(quiz, this.loadQuestions(quiz.id)));
  }

  /** STORY-011: quizzes start unpublished; publishing happens via quizzes_update. */
  create(caller: AuthUser, roomId: string, input: CreateQuizInput): QuizResponse {
    const room = this.getRoom(roomId);
    this.requireOwnerTeacher(caller, room);
    this.validateQuestions(input.questions);
    const quiz = this.db.transaction((tx) => {
      const row = tx
        .insert(quizzes)
        .values({
          roomId,
          title: input.title,
          opensAt: input.opensAt === undefined ? null : new Date(input.opensAt),
          closesAt: new Date(input.closesAt),
          publishedAt: null,
        })
        .returning()
        .all()[0];
      this.insertQuestions(tx, row.id, input.questions);
      return row;
    });
    return this.toQuizResponse(quiz, this.loadQuestions(quiz.id));
  }

  /** STORY-011: edit fields and/or replace the question set; publish by setting publishedAt. */
  update(caller: AuthUser, quizId: string, input: UpdateQuizInput): QuizResponse {
    const quiz = this.getQuiz(quizId);
    const room = this.getRoom(quiz.roomId);
    this.requireOwnerTeacher(caller, room);
    if (input.questions) {
      this.validateQuestions(input.questions);
    }
    const updated = this.db.transaction((tx) => {
      const row = tx
        .update(quizzes)
        .set({
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.opensAt !== undefined
            ? { opensAt: input.opensAt === null ? null : new Date(input.opensAt) }
            : {}),
          ...(input.closesAt !== undefined ? { closesAt: new Date(input.closesAt) } : {}),
          ...(input.publishedAt !== undefined
            ? { publishedAt: input.publishedAt === null ? null : new Date(input.publishedAt) }
            : {}),
        })
        .where(eq(quizzes.id, quizId))
        .returning()
        .all()[0];
      if (input.questions) {
        // Replacing the question set: options cascade on question delete.
        tx.delete(quizQuestions).where(eq(quizQuestions.quizId, quizId)).run();
        this.insertQuestions(tx, quizId, input.questions);
      }
      if (quiz.publishedAt === null && input.publishedAt != null) {
        // STORY-011: publishing makes the quiz available to enrolled students.
        const students = tx
          .select({ studentId: enrollments.studentId })
          .from(enrollments)
          .where(and(eq(enrollments.roomId, quiz.roomId), isNull(enrollments.removedAt)))
          .all();
        if (students.length > 0) {
          tx.insert(notifications)
            .values(
              students.map(({ studentId }) => ({
                userId: studentId,
                type: "quizPosted" as const,
                message: `New quiz in ${room.name}: "${row.title}"`,
                link: `/rooms/${quiz.roomId}/quizzes`,
              })),
            )
            .run();
        }
      }
      return row;
    });
    return this.toQuizResponse(updated, this.loadQuestions(quizId));
  }

  /** STORY-011: attempt list plus how often each option was chosen, for the owning teacher/admin. */
  results(caller: AuthUser, quizId: string): QuizResultsResponse {
    const quiz = this.getQuiz(quizId);
    const room = this.getRoom(quiz.roomId);
    const role = this.roleOf(caller.id);
    if (!(role === "admin" || (role === "teacher" && room.ownerTeacherId === caller.id))) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    const attempts = this.db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId))
      .orderBy(asc(quizAttempts.createdAt))
      .all();
    const counts = new Map<string, number>();
    for (const attempt of attempts) {
      for (const answer of parseAnswers(attempt.answers)) {
        const key = `${answer.questionId}:${answer.optionId}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return {
      attempts: attempts.map((attempt) => ({
        studentId: attempt.studentId,
        status: attempt.status,
        score: attempt.score,
      })),
      distribution: [...counts.entries()].map(([key, count]) => {
        const [questionId, optionId] = key.split(":");
        return { questionId, optionId, count };
      }),
    };
  }

  /** STORY-012: an enrolled student's attempt for resumption (answers) or the completed result. */
  getAttempt(caller: AuthUser, quizId: string): QuizAttemptView {
    const quiz = this.getQuiz(quizId);
    const role = this.roleOf(caller.id);
    if (role !== "student" || !this.isActivelyEnrolled(quiz.roomId, caller.id)) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    const questions = this.loadQuestions(quizId);
    const quizResponse = this.toQuizResponse(quiz, questions);
    const attempt = this.findAttempt(quizId, caller.id);
    if (!attempt) {
      return { quiz: quizResponse };
    }
    const answers = parseAnswers(attempt.answers);
    return {
      quiz: quizResponse,
      attempt: {
        status: attempt.status,
        answers,
        score: attempt.score,
        submittedAt: attempt.submittedAt?.toISOString() ?? null,
        // Correctness is only revealed once the attempt is submitted.
        ...(attempt.status === "submitted"
          ? { perQuestion: this.scoreAttempt(questions, answers).perQuestion }
          : {}),
      },
    };
  }

  /** STORY-012: saves answers in progress, or submits and auto-scores before the close time. */
  saveAttempt(caller: AuthUser, quizId: string, input: SaveAttemptInput): SaveAttemptResponse {
    const quiz = this.getQuiz(quizId);
    const role = this.roleOf(caller.id);
    if (role !== "student" || !this.isActivelyEnrolled(quiz.roomId, caller.id)) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    const existing = this.findAttempt(quizId, caller.id);
    if (existing?.status === "submitted") {
      throw new AppError("CONFLICT", 409, "You have already taken this quiz.");
    }
    const questions = this.loadQuestions(quizId);
    this.validateAnswers(input.answers, questions);
    if (Date.now() > quiz.closesAt.getTime()) {
      // STORY-012: a closed quiz accepts nothing new; a submit still auto-scores the saved attempt.
      if (input.submit && existing) {
        const answers = mergeAnswers(parseAnswers(existing.answers), input.answers);
        const { score } = this.scoreAttempt(questions, answers);
        const submittedAt = new Date();
        this.db.transaction((tx) => {
          tx.update(quizAttempts)
            .set({ status: "submitted", answers: JSON.stringify(answers), score, submittedAt })
            .where(eq(quizAttempts.id, existing.id))
            .run();
          this.insertScoredNotification(tx, caller.id, quiz, score, questions);
        });
      }
      throw new AppError("VALIDATION_ERROR", 400, "This quiz is closed.");
    }
    const answersJson = JSON.stringify(input.answers);
    if (!input.submit) {
      this.db
        .insert(quizAttempts)
        .values({ quizId, studentId: caller.id, status: "in_progress", answers: answersJson })
        .onConflictDoUpdate({
          target: [quizAttempts.quizId, quizAttempts.studentId],
          set: { answers: answersJson },
        })
        .run();
      return { status: "in_progress" };
    }
    const { score, perQuestion } = this.scoreAttempt(questions, input.answers);
    const submittedAt = new Date();
    this.db.transaction((tx) => {
      tx.insert(quizAttempts)
        .values({
          quizId,
          studentId: caller.id,
          status: "submitted",
          answers: answersJson,
          score,
          submittedAt,
        })
        .onConflictDoUpdate({
          target: [quizAttempts.quizId, quizAttempts.studentId],
          set: { status: "submitted", answers: answersJson, score, submittedAt },
        })
        .run();
      this.insertScoredNotification(tx, caller.id, quiz, score, questions);
    });
    return { score, perQuestion };
  }

  /** STORY-011: every question needs exactly one correct option. */
  private validateQuestions(questions: QuizQuestionInput[]): void {
    for (const question of questions) {
      const correctCount = question.options.filter((option) => option.isCorrect).length;
      if (correctCount !== 1) {
        throw new AppError("VALIDATION_ERROR", 400, "Select a correct option");
      }
    }
  }

  private insertQuestions(tx: Tx, quizId: string, questions: QuizQuestionInput[]): void {
    for (const question of questions) {
      const questionRow = tx
        .insert(quizQuestions)
        .values({ quizId, prompt: question.prompt, points: question.points })
        .returning()
        .all()[0];
      tx.insert(quizOptions)
        .values(
          question.options.map((option) => ({
            questionId: questionRow.id,
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        )
        .run();
    }
  }

  private validateAnswers(answers: AttemptAnswer[], questions: LoadedQuestion[]): void {
    for (const answer of answers) {
      const question = questions.find((candidate) => candidate.id === answer.questionId);
      if (!question || !question.options.some((option) => option.id === answer.optionId)) {
        throw new AppError("VALIDATION_ERROR", 400, "Invalid answer");
      }
    }
  }

  /** Earned points plus chosen-vs-correct for every question (unanswered → chosen null). */
  private scoreAttempt(
    questions: LoadedQuestion[],
    answers: AttemptAnswer[],
  ): { score: number; perQuestion: PerQuestionResult[] } {
    const chosenByQuestion = new Map(answers.map((answer) => [answer.questionId, answer.optionId]));
    let score = 0;
    const perQuestion = questions.map((question) => {
      const chosenOptionId = chosenByQuestion.get(question.id) ?? null;
      const correctOptionId = question.options.find((option) => option.isCorrect)?.id ?? "";
      const isCorrect = chosenOptionId !== null && chosenOptionId === correctOptionId;
      if (isCorrect) {
        score += question.points;
      }
      return { questionId: question.id, chosenOptionId, correctOptionId, isCorrect };
    });
    return { score, perQuestion };
  }

  private insertScoredNotification(
    tx: Tx,
    studentId: string,
    quiz: QuizRow,
    score: number,
    questions: LoadedQuestion[],
  ): void {
    const total = questions.reduce((sum, question) => sum + question.points, 0);
    tx.insert(notifications)
      .values({
        userId: studentId,
        type: "quizScored" as const,
        message: `Quiz scored: "${quiz.title}" — ${score}/${total}`,
        link: `/rooms/${quiz.roomId}/quizzes`,
      })
      .run();
  }

  private loadQuestions(quizId: string): LoadedQuestion[] {
    const questionRows = this.db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .all();
    if (questionRows.length === 0) {
      return [];
    }
    const optionRows = this.db
      .select()
      .from(quizOptions)
      .where(
        inArray(
          quizOptions.questionId,
          questionRows.map((question) => question.id),
        ),
      )
      .all();
    return questionRows.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      points: question.points,
      options: optionRows
        .filter((option) => option.questionId === question.id)
        .map((option) => ({ id: option.id, text: option.text, isCorrect: option.isCorrect })),
    }));
  }

  private toQuizResponse(quiz: QuizRow, questions: LoadedQuestion[]): QuizResponse {
    return {
      id: quiz.id,
      roomId: quiz.roomId,
      title: quiz.title,
      opensAt: quiz.opensAt?.toISOString() ?? null,
      closesAt: quiz.closesAt.toISOString(),
      publishedAt: quiz.publishedAt?.toISOString() ?? null,
      questions: questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        points: question.points,
        options: question.options.map((option) => ({ id: option.id, text: option.text })),
      })),
    };
  }

  private findAttempt(quizId: string, studentId: string) {
    return this.db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.studentId, studentId)))
      .get();
  }

  private getQuiz(quizId: string): QuizRow {
    const quiz = this.db.select().from(quizzes).where(eq(quizzes.id, quizId)).get();
    if (!quiz) {
      throw new AppError("NOT_FOUND", 404, "Quiz not found");
    }
    return quiz;
  }

  private getRoom(roomId: string): RoomRow {
    const room = this.db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) {
      throw new AppError("NOT_FOUND", 404, "Room not found");
    }
    return room;
  }

  /** Only the owning teacher may post or edit room coursework (ROLE-009). */
  private requireOwnerTeacher(caller: AuthUser, room: RoomRow): void {
    const role = this.roleOf(caller.id);
    if (role !== "teacher" || room.ownerTeacherId !== caller.id) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
  }

  private roleOf(userId: string): Role | undefined {
    return this.db.select({ role: users.role }).from(users).where(eq(users.id, userId)).get()?.role;
  }

  private isActivelyEnrolled(roomId: string, studentId: string): boolean {
    return (
      this.db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.roomId, roomId), eq(enrollments.studentId, studentId), isNull(enrollments.removedAt)))
        .get() !== undefined
    );
  }
}

/** `answers` is stored as JSON text; anything unreadable degrades to "no answers". */
function parseAnswers(json: string): AttemptAnswer[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (answer): answer is AttemptAnswer =>
        typeof answer === "object" &&
        answer !== null &&
        typeof (answer as AttemptAnswer).questionId === "string" &&
        typeof (answer as AttemptAnswer).optionId === "string",
    );
  } catch {
    return [];
  }
}

/** Later answers win; keyed by questionId so a question keeps a single choice. */
function mergeAnswers(saved: AttemptAnswer[], incoming: AttemptAnswer[]): AttemptAnswer[] {
  const byQuestion = new Map(saved.map((answer) => [answer.questionId, answer]));
  for (const answer of incoming) {
    byQuestion.set(answer.questionId, answer);
  }
  return [...byQuestion.values()];
}
