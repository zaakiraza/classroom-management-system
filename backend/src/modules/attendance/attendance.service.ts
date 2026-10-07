import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, gte, inArray, isNull, lt } from "drizzle-orm";
import { type AuthUser, requireRole } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { attendanceEntries, attendanceRecords, enrollments, rooms, users } from "../../db/schema";
import type { RoomRow } from "../rooms/rooms.schemas";
import type { Role } from "../users/users.schemas";
import {
  type AttendanceMeResponse,
  type AttendanceRecordResponse,
  type AttendanceRecordRow,
  type UpsertAttendanceInput,
  parseDate,
  toAttendanceEntryResponse,
  toAttendanceRecordResponse,
} from "./attendance.schemas";

/** Teachers may take and edit daily attendance only within the last 7 days (ROLE-007, STORY-006). */
const EDIT_WINDOW_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AttendanceService {
  constructor(@Inject(DB) private readonly db: Db) {}

  get(caller: AuthUser, roomId: string, date: string): { record: AttendanceRecordResponse | null } {
    const room = this.getRoom(roomId);
    const role = this.roleOf(caller.id);
    // Admins can view any room's attendance; teachers only their own (ROLE-006).
    if (role !== "admin" && !(role === "teacher" && room.ownerTeacherId === caller.id)) {
      throw new AppError("FORBIDDEN", 403, "You do not have access to this page.");
    }
    const record = this.findRecord(roomId, date);
    return { record: record !== undefined ? this.toRecord(record) : null };
  }

  upsert(caller: AuthUser, roomId: string, input: UpsertAttendanceInput): AttendanceRecordResponse {
    const room = this.getRoom(roomId);
    const role = this.roleOf(caller.id);
    if (role !== "teacher" || room.ownerTeacherId !== caller.id) {
      throw new AppError("FORBIDDEN", 403, "You do not have access to this page.");
    }
    this.assertWithinEditWindow(input.date);
    this.assertEntriesEnrolled(roomId, input.entries);

    return this.db.transaction((tx) => {
      // An existing record for the date is replaced wholesale so re-saving is idempotent.
      const existing = this.findRecord(roomId, input.date);
      const record: AttendanceRecordRow = existing
        ? existing
        : tx
            .insert(attendanceRecords)
            .values({ roomId, date: parseDate(input.date) })
            .returning()
            .all()[0];
      tx.delete(attendanceEntries).where(eq(attendanceEntries.attendanceRecordId, record.id)).run();
      if (input.entries.length > 0) {
        tx.insert(attendanceEntries)
          .values(
            input.entries.map((entry) => ({
              attendanceRecordId: record.id,
              studentId: entry.studentId,
              status: entry.status,
            })),
          )
          .run();
      }
      const entries = tx
        .select()
        .from(attendanceEntries)
        .where(eq(attendanceEntries.attendanceRecordId, record.id))
        .orderBy(asc(attendanceEntries.studentId))
        .all();
      return toAttendanceRecordResponse(record, entries);
    });
  }

  me(caller: AuthUser, roomId: string): AttendanceMeResponse {
    this.getRoom(roomId);
    const role = this.roleOf(caller.id);
    requireRole(role, ["student"], "view their attendance history");
    const enrollment = this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.roomId, roomId), eq(enrollments.studentId, caller.id)))
      .get();
    if (!enrollment) {
      throw new AppError("FORBIDDEN", 403, "You do not have access to this room.");
    }
    const entries = this.db
      .select({ entry: attendanceEntries })
      .from(attendanceEntries)
      .innerJoin(attendanceRecords, eq(attendanceRecords.id, attendanceEntries.attendanceRecordId))
      .where(and(eq(attendanceRecords.roomId, roomId), eq(attendanceEntries.studentId, caller.id)))
      .orderBy(asc(attendanceRecords.date))
      .all()
      .map(({ entry }) => entry);
    const counts = { present: 0, absent: 0, late: 0 };
    for (const entry of entries) {
      counts[entry.status] += 1;
    }
    return {
      enrollmentActive: enrollment.removedAt === null,
      entries: entries.map(toAttendanceEntryResponse),
      counts,
    };
  }

  private toRecord(record: AttendanceRecordRow): AttendanceRecordResponse {
    const entries = this.db
      .select()
      .from(attendanceEntries)
      .where(eq(attendanceEntries.attendanceRecordId, record.id))
      .orderBy(asc(attendanceEntries.studentId))
      .all();
    return toAttendanceRecordResponse(record, entries);
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

  /** Matches by calendar day, so timestamps stored off UTC midnight (seed data) still resolve. */
  private findRecord(roomId: string, date: string): AttendanceRecordRow | undefined {
    const start = parseDate(date);
    return this.db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.roomId, roomId),
          gte(attendanceRecords.date, start),
          lt(attendanceRecords.date, new Date(start.getTime() + DAY_MS)),
        ),
      )
      .get();
  }

  /** A date more than 7 days in the past is immutable (STORY-006). */
  private assertWithinEditWindow(date: string): void {
    const today = parseDate(new Date().toISOString().slice(0, 10));
    const ageDays = Math.floor((today.getTime() - parseDate(date).getTime()) / DAY_MS);
    if (ageDays > EDIT_WINDOW_DAYS) {
      throw new AppError("LOCKED", 423, "Attendance for this date is locked.");
    }
  }

  /** Each entry must name a distinct, actively enrolled student. */
  private assertEntriesEnrolled(roomId: string, entries: UpsertAttendanceInput["entries"]): void {
    const studentIds = entries.map((entry) => entry.studentId);
    if (new Set(studentIds).size !== studentIds.length) {
      throw new AppError("VALIDATION_ERROR", 400, "Each student may appear only once in the attendance entries");
    }
    if (studentIds.length === 0) {
      return;
    }
    const enrolled = new Set(
      this.db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .where(
          and(eq(enrollments.roomId, roomId), isNull(enrollments.removedAt), inArray(enrollments.studentId, studentIds)),
        )
        .all()
        .map(({ studentId }) => studentId),
    );
    const missing = studentIds.filter((studentId) => !enrolled.has(studentId));
    if (missing.length > 0) {
      throw new AppError("VALIDATION_ERROR", 400, "All students in the entries must be enrolled in this room", {
        students: missing,
      });
    }
  }
}
