import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import {
  assignments,
  enrollments,
  quizAttempts,
  quizQuestions,
  quizzes,
  rooms,
  submissions,
  users,
} from "../../db/schema";
import type { RoomRow } from "../rooms/rooms.schemas";
import type { Role } from "../users/users.schemas";
import { type GradeItem, type MyGradebook, type StudentGradebook } from "./gradebook.schemas";

const NO_ACCESS = "You do not have access to this page.";

@Injectable()
export class GradebookService {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** STORY-013: owning teacher/admin see every actively enrolled student, graded or not. */
  get(caller: AuthUser, roomId: string): StudentGradebook[] {
    const room = this.getRoom(roomId);
    const role = this.roleOf(caller.id);
    if (!(role === "admin" || (role === "teacher" && room.ownerTeacherId === caller.id))) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    const graded = this.gradedItemsByStudent(roomId);
    return this.db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(and(eq(enrollments.roomId, roomId), isNull(enrollments.removedAt)))
      .orderBy(asc(enrollments.enrolledAt))
      .all()
      .map(({ studentId }) => {
        const items = graded.get(studentId) ?? [];
        return { studentId, items, percentage: percentageOf(items) };
      });
  }

  /** STORY-013: an enrolled student sees only their own items and percentage. */
  me(caller: AuthUser, roomId: string): MyGradebook {
    this.getRoom(roomId); // unknown rooms are a 404
    const role = this.roleOf(caller.id);
    if (role !== "student" || !this.isActivelyEnrolled(roomId, caller.id)) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    const items = this.gradedItemsByStudent(roomId).get(caller.id) ?? [];
    return { items, percentage: percentageOf(items) };
  }

  /** Graded assignment submissions and submitted quiz attempts, grouped per student. */
  private gradedItemsByStudent(roomId: string): Map<string, GradeItem[]> {
    const items = new Map<string, GradeItem[]>();
    const push = (studentId: string, item: GradeItem): void => {
      const list = items.get(studentId);
      if (list) {
        list.push(item);
      } else {
        items.set(studentId, [item]);
      }
    };

    const submissionRows = this.db
      .select({
        studentId: submissions.studentId,
        points: submissions.gradePoints,
        comment: submissions.gradeComment,
        assignmentId: assignments.id,
        total: assignments.totalPoints,
      })
      .from(submissions)
      .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .where(and(eq(assignments.roomId, roomId), isNotNull(submissions.gradePoints)))
      .orderBy(asc(submissions.gradedAt))
      .all();
    for (const row of submissionRows) {
      push(row.studentId, {
        type: "assignment",
        itemId: row.assignmentId,
        points: row.points ?? 0,
        total: row.total,
        comment: row.comment ?? null,
      });
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
    const attemptRows = this.db
      .select({
        studentId: quizAttempts.studentId,
        quizId: quizAttempts.quizId,
        score: quizAttempts.score,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(
        and(
          eq(quizzes.roomId, roomId),
          eq(quizAttempts.status, "submitted"),
          isNotNull(quizAttempts.score),
        ),
      )
      .orderBy(asc(quizAttempts.submittedAt))
      .all();
    for (const row of attemptRows) {
      push(row.studentId, {
        type: "quiz",
        itemId: row.quizId,
        points: row.score ?? 0,
        total: quizTotals.get(row.quizId) ?? 0,
        comment: null,
      });
    }
    return items;
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

/** Earned points over graded totals as a percentage, rounded to 2 decimals; 0 when nothing is graded. */
function percentageOf(items: GradeItem[]): number {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  if (total <= 0) {
    return 0;
  }
  const earned = items.reduce((sum, item) => sum + item.points, 0);
  return Math.round((earned / total) * 10000) / 100;
}
