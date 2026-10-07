import { z } from "zod";
import { attendanceEntries, attendanceRecords } from "../../db/schema";

/** `format: date` → YYYY-MM-DD. */
const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date as YYYY-MM-DD")
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()), "Invalid calendar date");

export const AttendanceStatusSchema = z.enum(["present", "absent", "late"]);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

export const GetAttendanceQuerySchema = z.object({ date: DateString });
export type GetAttendanceQuery = z.infer<typeof GetAttendanceQuerySchema>;

export const UpsertAttendanceSchema = z.object({
  date: DateString,
  entries: z.array(
    z.object({
      studentId: z.string().trim().min(1),
      status: AttendanceStatusSchema,
    }),
  ),
});
export type UpsertAttendanceInput = z.infer<typeof UpsertAttendanceSchema>;

/** The documented response shapes: exactly these fields, nothing internal. */
export interface AttendanceEntryResponse {
  id: string;
  attendanceRecordId: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface AttendanceRecordResponse {
  id: string;
  roomId: string;
  date: string;
  entries: AttendanceEntryResponse[];
}

export interface AttendanceMeResponse {
  enrollmentActive: boolean;
  entries: AttendanceEntryResponse[];
  counts: { present: number; absent: number; late: number };
}

export type AttendanceRecordRow = typeof attendanceRecords.$inferSelect;
export type AttendanceEntryRow = typeof attendanceEntries.$inferSelect;

/** Parse a YYYY-MM-DD string into a UTC-midnight Date so it round-trips losslessly. */
export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toAttendanceEntryResponse(row: AttendanceEntryRow): AttendanceEntryResponse {
  return {
    id: row.id,
    attendanceRecordId: row.attendanceRecordId,
    studentId: row.studentId,
    status: row.status,
  };
}

export function toAttendanceRecordResponse(
  row: AttendanceRecordRow,
  entries: AttendanceEntryRow[],
): AttendanceRecordResponse {
  return {
    id: row.id,
    roomId: row.roomId,
    date: row.date.toISOString().slice(0, 10),
    entries: entries.map(toAttendanceEntryResponse),
  };
}
