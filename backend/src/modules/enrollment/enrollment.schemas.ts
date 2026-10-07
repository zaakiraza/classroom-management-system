import { z } from "zod";
import { enrollments } from "../../db/schema";
import type { UserResponse } from "../users/users.schemas";

export const EnrollStudentSchema = z.object({
  studentId: z.string().trim().min(1),
});
export type EnrollStudentInput = z.infer<typeof EnrollStudentSchema>;

/** The documented response shape; `removedAt` retains removal history (STORY-005). */
export interface EnrollmentResponse {
  id: string;
  roomId: string;
  studentId: string;
  enrolledAt: string;
  removedAt: string | null;
  student?: UserResponse;
}

export type EnrollmentRow = typeof enrollments.$inferSelect;

export function toEnrollmentResponse(row: EnrollmentRow, student?: UserResponse): EnrollmentResponse {
  return {
    id: row.id,
    roomId: row.roomId,
    studentId: row.studentId,
    enrolledAt: row.enrolledAt.toISOString(),
    removedAt: row.removedAt !== null ? row.removedAt.toISOString() : null,
    ...(student !== undefined ? { student } : {}),
  };
}
