import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { enrollments, rooms, users } from "../../db/schema";
import { type EnrollStudentInput, toEnrollmentResponse, type EnrollmentResponse } from "./enrollment.schemas";
import { toUserResponse } from "../users/users.schemas";

@Injectable()
export class EnrollmentService {
  constructor(@Inject(DB) private readonly db: Db) {}

  list(caller: AuthUser, roomId: string): EnrollmentResponse[] {
    this.authorize(caller, roomId);
    const rows = this.db
      .select({ enrollment: enrollments, student: users })
      .from(enrollments)
      .innerJoin(users, eq(users.id, enrollments.studentId))
      .where(eq(enrollments.roomId, roomId))
      .orderBy(asc(enrollments.enrolledAt))
      .all();
    return rows.map(({ enrollment, student }) => toEnrollmentResponse(enrollment, toUserResponse(student)));
  }

  enroll(caller: AuthUser, roomId: string, input: EnrollStudentInput): EnrollmentResponse {
    this.authorize(caller, roomId);
    const student = this.db.select().from(users).where(eq(users.id, input.studentId)).get();
    if (!student || student.role !== "student") {
      throw new AppError("NOT_FOUND", 404, "Student not found");
    }
    const existing = this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.roomId, roomId), eq(enrollments.studentId, input.studentId)))
      .get();
    if (existing && existing.removedAt === null) {
      throw new AppError("CONFLICT", 409, "This student is already enrolled.");
    }
    // History is retained: a removed enrollment is reactivated instead of duplicated.
    const row = existing
      ? this.db
          .update(enrollments)
          .set({ removedAt: null, enrolledAt: new Date() })
          .where(eq(enrollments.id, existing.id))
          .returning()
          .all()[0]
      : this.db
          .insert(enrollments)
          .values({ roomId, studentId: input.studentId })
          .returning()
          .all()[0];
    return toEnrollmentResponse(row, toUserResponse(student));
  }

  remove(caller: AuthUser, roomId: string, studentId: string): void {
    this.authorize(caller, roomId);
    const existing = this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.roomId, roomId), eq(enrollments.studentId, studentId)))
      .get();
    if (!existing || existing.removedAt !== null) {
      throw new AppError("NOT_FOUND", 404, "Student is not enrolled in this room");
    }
    this.db.update(enrollments).set({ removedAt: new Date() }).where(eq(enrollments.id, existing.id)).run();
  }

  /** Only admins and the owning teacher may manage a room's roster (STORY-005). */
  private authorize(caller: AuthUser, roomId: string): void {
    const room = this.db.select().from(rooms).where(eq(rooms.id, roomId)).get();
    if (!room) {
      throw new AppError("NOT_FOUND", 404, "Room not found");
    }
    const role = this.db.select({ role: users.role }).from(users).where(eq(users.id, caller.id)).get()?.role;
    if (role !== "admin" && !(role === "teacher" && room.ownerTeacherId === caller.id)) {
      throw new AppError("FORBIDDEN", 403, "You do not have access to this room.");
    }
  }
}
