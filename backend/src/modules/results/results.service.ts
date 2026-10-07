import { Inject, Injectable } from "@nestjs/common";
import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import {
  assignments,
  enrollments,
  notifications,
  quizAttempts,
  quizQuestions,
  quizzes,
  rooms,
  submissions,
  termResults,
  users,
} from "../../db/schema";
import type { RoomRow } from "../rooms/rooms.schemas";
import type { Role } from "../users/users.schemas";
import { type PublishResultInput, type TermResultResponse, type TermSummary, toTermResultResponse } from "./results.schemas";

const NO_ACCESS = "You do not have access to this page.";
const TERM_LOCKED = "The term is closed; results are locked.";

/** The transaction handle passed to `db.transaction` callbacks. */
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

@Injectable()
export class ResultsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** STORY-014: teacher/admin see draft+published; students see published only. */
  get(caller: AuthUser, roomId: string): TermResultResponse {
    const room = this.getRoom(roomId);
    const role = this.roleOf(caller.id);
    let row;
    if (role === "student") {
      if (!this.isActivelyEnrolled(roomId, caller.id)) {
        throw new AppError("FORBIDDEN", 403, NO_ACCESS);
      }
      row = this.latest(roomId, true);
    } else if (role === "admin" || (role === "teacher" && room.ownerTeacherId === caller.id)) {
      row = this.latest(roomId, false);
    } else {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    if (!row) {
      throw new AppError("NOT_FOUND", 404, "Term result not found");
    }
    return toTermResultResponse(row);
  }

  /** STORY-014: the owning teacher previews (publish=false) or publishes (publish=true) the
   * system-computed summary; editing is locked once the term close date has passed. */
  publish(caller: AuthUser, roomId: string, input: PublishResultInput): TermResultResponse {
    const room = this.getRoom(roomId);
    const role = this.roleOf(caller.id);
    if (role !== "teacher" || room.ownerTeacherId !== caller.id) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    if (room.termCloseDate && isPastDay(new Date(), room.termCloseDate)) {
      throw new AppError("LOCKED", 423, TERM_LOCKED);
    }

    const existing = input.term !== undefined ? this.byRoomAndTerm(roomId, input.term) : this.latest(roomId, false);
    const term = input.term ?? existing?.term ?? currentTerm();
    const summary = this.computeSummary(roomId);
    const publishedAt = input.publish === true ? new Date() : null;
    const wasPublished = existing?.publishedAt != null;

    return this.db.transaction((tx) => {
      const row = existing
        ? tx
            .update(termResults)
            .set({ summary: JSON.stringify(summary), publishedAt })
            .where(eq(termResults.id, existing.id))
            .returning()
            .all()[0]
        : tx
            .insert(termResults)
            .values({ roomId, term, summary: JSON.stringify(summary), publishedAt })
            .returning()
            .all()[0];
      if (input.publish === true && !wasPublished) {
        this.notifyEnrolled(tx, roomId, room.name);
      }
      return toTermResultResponse(row);
    });
  }

  /** Per actively enrolled student: earned points over graded totals, plus the class average. */
  private computeSummary(roomId: string): TermSummary {
    const earned = new Map<string, number>();
    const totals = new Map<string, number>();
    const add = (studentId: string, points: number, max: number): void => {
      earned.set(studentId, (earned.get(studentId) ?? 0) + points);
      totals.set(studentId, (totals.get(studentId) ?? 0) + max);
    };

    for (const row of this.db
      .select({
        studentId: submissions.studentId,
        points: submissions.gradePoints,
        totalPoints: assignments.totalPoints,
      })
      .from(submissions)
      .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .where(and(eq(assignments.roomId, roomId), isNotNull(submissions.gradePoints)))
      .all()) {
      add(row.studentId, row.points ?? 0, row.totalPoints);
    }

    // Quiz totals = sum of their question points.
    const quizTotals = new Map<string, number>();
    for (const row of this.db
      .select({ quizId: quizQuestions.quizId, points: quizQuestions.points })
      .from(quizQuestions)
      .innerJoin(quizzes, eq(quizQuestions.quizId, quizzes.id))
      .where(eq(quizzes.roomId, roomId))
      .all()) {
      quizTotals.set(row.quizId, (quizTotals.get(row.quizId) ?? 0) + row.points);
    }
    for (const row of this.db
      .select({ studentId: quizAttempts.studentId, quizId: quizAttempts.quizId, score: quizAttempts.score })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(
        and(
          eq(quizzes.roomId, roomId),
          eq(quizAttempts.status, "submitted"),
          isNotNull(quizAttempts.score),
        ),
      )
      .all()) {
      add(row.studentId, row.score ?? 0, quizTotals.get(row.quizId) ?? 0);
    }

    const students = this.db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(and(eq(enrollments.roomId, roomId), isNull(enrollments.removedAt)))
      .orderBy(asc(enrollments.enrolledAt))
      .all()
      .map(({ studentId }) => ({
        studentId,
        percentage: percentageOf(earned.get(studentId) ?? 0, totals.get(studentId) ?? 0),
      }));
    const classAverage = students.length
      ? Math.round((students.reduce((sum, s) => sum + s.percentage, 0) / students.length) * 100) / 100
      : 0;
    return { students, classAverage };
  }

  /** One resultPublished notification per actively enrolled student on first publish. */
  private notifyEnrolled(tx: Tx, roomId: string, roomName: string): void {
    const students = tx
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(and(eq(enrollments.roomId, roomId), isNull(enrollments.removedAt)))
      .all();
    if (students.length === 0) {
      return;
    }
    tx.insert(notifications)
      .values(
        students.map(({ studentId }) => ({
          userId: studentId,
          type: "resultPublished" as const,
          message: `Term result published for ${roomName}`,
          link: `/rooms/${roomId}/result`,
        })),
      )
      .run();
  }

  /** The most recent result for the room, optionally only published ones. */
  private latest(roomId: string, publishedOnly: boolean) {
    const conditions = [eq(termResults.roomId, roomId)];
    if (publishedOnly) {
      conditions.push(isNotNull(termResults.publishedAt));
    }
    return this.db
      .select()
      .from(termResults)
      .where(and(...conditions))
      .orderBy(desc(termResults.updatedAt), desc(termResults.createdAt))
      .get();
  }

  private byRoomAndTerm(roomId: string, term: string) {
    return this.db
      .select()
      .from(termResults)
      .where(and(eq(termResults.roomId, roomId), eq(termResults.term, term)))
      .get();
  }

  private getRoom(roomId: string): RoomRow {
    const room = this.db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) {
      throw new AppError("NOT_FOUND", 404, "Room not found");
    }
    return room;
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

/** True when `today` falls on a calendar day after `close` ("on or before" still allows changes). */
function isPastDay(today: Date, close: Date): boolean {
  const dayOf = (date: Date): number => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return dayOf(today) > dayOf(close);
}

/** Season + year, matching how terms are named elsewhere (e.g. "Fall 2026"). */
function currentTerm(): string {
  const now = new Date();
  const season = now.getMonth() < 5 ? "Spring" : now.getMonth() < 8 ? "Summer" : "Fall";
  return `${season} ${now.getFullYear()}`;
}

function percentageOf(earned: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((earned / total) * 10000) / 100;
}
