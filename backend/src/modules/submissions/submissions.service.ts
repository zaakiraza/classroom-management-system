import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, isNull } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { assignments, enrollments, notifications, rooms, submissions, users } from "../../db/schema";
import type { AssignmentRow } from "../assignments/assignments.schemas";
import type { RoomRow } from "../rooms/rooms.schemas";
import type { Role } from "../users/users.schemas";
import {
  ALLOWED_EXTENSIONS,
  FILE_REJECTED_MESSAGE,
  MAX_FILE_BYTES,
  type GetSubmissionQuery,
  type GradeSubmissionInput,
  type SubmissionResponse,
  type SubmissionRow,
  toSubmissionResponse,
  type UploadedFile,
} from "./submissions.schemas";

const NO_ACCESS = "You do not have access to this page.";

@Injectable()
export class SubmissionsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** STORY-009: enrolled students upload or replace their own file; late first uploads are flagged. */
  upload(caller: AuthUser, assignmentId: string, file: UploadedFile | undefined): SubmissionResponse {
    const assignment = this.getAssignment(assignmentId);
    const role = this.roleOf(caller.id);
    if (role !== "student" || !this.isActivelyEnrolled(assignment.roomId, caller.id)) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    // The 20 MB cap and extension whitelist are enforced here rather than via multer's fileSize
    // limit, so an oversized file gets the documented 400 message instead of multer's 413.
    const accepted =
      file !== undefined &&
      file.size > 0 &&
      file.size <= MAX_FILE_BYTES &&
      ALLOWED_EXTENSIONS.some((extension) => file.originalname.toLowerCase().endsWith(extension));
    if (!accepted) {
      throw new AppError("VALIDATION_ERROR", 400, FILE_REJECTED_MESSAGE);
    }
    const now = new Date();
    const isLate = now.getTime() > assignment.dueAt.getTime();
    const existing = this.findSubmission(assignmentId, caller.id);
    if (existing && isLate) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        "The deadline has passed; this submission can no longer be replaced.",
      );
    }
    // No storage endpoint in the contract: the file is returned inline as a data URL.
    const fileUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const row = this.db
      .insert(submissions)
      .values({ assignmentId, studentId: caller.id, fileUrl, submittedAt: now, isLate })
      .onConflictDoUpdate({
        target: [submissions.assignmentId, submissions.studentId],
        set: { fileUrl, submittedAt: now, isLate },
      })
      .returning()
      .all()[0];
    return toSubmissionResponse(row);
  }

  /** Students read their own; the owning teacher or an admin reads one student's via ?studentId=. */
  getMine(caller: AuthUser, assignmentId: string, query: GetSubmissionQuery): SubmissionResponse {
    const assignment = this.getAssignment(assignmentId);
    const role = this.roleOf(caller.id);
    let studentId: string;
    if (role === "student") {
      if (query.studentId && query.studentId !== caller.id) {
        throw new AppError("FORBIDDEN", 403, NO_ACCESS);
      }
      this.requireActivelyEnrolled(assignment.roomId, caller.id);
      studentId = caller.id;
    } else {
      const room = this.getRoom(assignment.roomId);
      if (!(role === "admin" || (role === "teacher" && room.ownerTeacherId === caller.id))) {
        throw new AppError("FORBIDDEN", 403, NO_ACCESS);
      }
      if (!query.studentId) {
        throw new AppError("VALIDATION_ERROR", 400, "studentId query parameter is required");
      }
      studentId = query.studentId;
    }
    const row = this.findSubmission(assignmentId, studentId);
    if (!row) {
      throw new AppError("NOT_FOUND", 404, "Submission not found");
    }
    return toSubmissionResponse(row);
  }

  /** STORY-010: the owning teacher/admin sees every submission with its Late flag. */
  list(caller: AuthUser, assignmentId: string): SubmissionResponse[] {
    const assignment = this.getAssignment(assignmentId);
    const room = this.getRoom(assignment.roomId);
    const role = this.roleOf(caller.id);
    if (!(role === "admin" || (role === "teacher" && room.ownerTeacherId === caller.id))) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    return this.db
      .select()
      .from(submissions)
      .where(eq(submissions.assignmentId, assignmentId))
      .orderBy(asc(submissions.submittedAt))
      .all()
      .map(toSubmissionResponse);
  }

  /** STORY-010: only the owning teacher grades, within 0-total; the student is notified. */
  grade(caller: AuthUser, submissionId: string, input: GradeSubmissionInput): SubmissionResponse {
    const submission = this.db.select().from(submissions).where(eq(submissions.id, submissionId)).get();
    if (!submission) {
      throw new AppError("NOT_FOUND", 404, "Submission not found");
    }
    const assignment = this.getAssignment(submission.assignmentId);
    const room = this.getRoom(assignment.roomId);
    const role = this.roleOf(caller.id);
    if (role !== "teacher" || room.ownerTeacherId !== caller.id) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
    if (input.gradePoints < 0 || input.gradePoints > assignment.totalPoints) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        `Points must be between 0 and ${assignment.totalPoints}.`,
      );
    }
    const updated = this.db.transaction((tx) => {
      const row = tx
        .update(submissions)
        .set({ gradePoints: input.gradePoints, gradeComment: input.gradeComment ?? null, gradedAt: new Date() })
        .where(eq(submissions.id, submissionId))
        .returning()
        .all()[0];
      tx.insert(notifications)
        .values({
          userId: submission.studentId,
          type: "assignmentGraded" as const,
          message: `Assignment graded: "${assignment.title}" — ${input.gradePoints}/${assignment.totalPoints}`,
          link: `/rooms/${assignment.roomId}/assignments`,
        })
        .run();
      return row;
    });
    return toSubmissionResponse(updated);
  }

  private findSubmission(assignmentId: string, studentId: string): SubmissionRow | undefined {
    return this.db
      .select()
      .from(submissions)
      .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId)))
      .get();
  }

  private getAssignment(assignmentId: string): AssignmentRow {
    const assignment = this.db.select().from(assignments).where(eq(assignments.id, assignmentId)).get();
    if (!assignment) {
      throw new AppError("NOT_FOUND", 404, "Assignment not found");
    }
    return assignment;
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

  private requireActivelyEnrolled(roomId: string, studentId: string): void {
    if (!this.isActivelyEnrolled(roomId, studentId)) {
      throw new AppError("FORBIDDEN", 403, NO_ACCESS);
    }
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
