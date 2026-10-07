import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, isNull } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { assignments, enrollments, notifications, rooms, users } from "../../db/schema";
import type { RoomRow } from "../rooms/rooms.schemas";
import type { Role } from "../users/users.schemas";
import { type AssignmentResponse, type AssignmentRow, type CreateAssignmentInput, toAssignmentResponse } from "./assignments.schemas";

@Injectable()
export class AssignmentsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  list(caller: AuthUser, roomId: string): AssignmentResponse[] {
    this.authorizeViewer(caller, roomId);
    return this.db
      .select()
      .from(assignments)
      .where(eq(assignments.roomId, roomId))
      .orderBy(asc(assignments.createdAt))
      .all()
      .map(toAssignmentResponse);
  }

  create(caller: AuthUser, roomId: string, input: CreateAssignmentInput): AssignmentResponse {
    const room = this.getRoom(roomId);
    this.requireOwnerTeacher(caller, room);
    return this.db.transaction((tx) => {
      const row: AssignmentRow = tx
        .insert(assignments)
        .values({
          roomId,
          title: input.title,
          instructions: input.instructions,
          dueAt: new Date(input.dueAt),
          totalPoints: input.totalPoints,
        })
        .returning()
        .all()[0];
      // One in-app notification per actively enrolled student (STORY-008).
      const students = tx
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .where(and(eq(enrollments.roomId, roomId), isNull(enrollments.removedAt)))
        .all();
      if (students.length > 0) {
        tx.insert(notifications)
          .values(
            students.map(({ studentId }) => ({
              userId: studentId,
              type: "assignmentPosted" as const,
              message: `New assignment in ${room.name}: "${input.title}"`,
              link: `/rooms/${roomId}/assignments`,
            })),
          )
          .run();
      }
      return toAssignmentResponse(row);
    });
  }

  /** Admins read any room, teachers their own, students only while enrolled (STORY-008). */
  private authorizeViewer(caller: AuthUser, roomId: string): void {
    const room = this.getRoom(roomId);
    const role = this.roleOf(caller.id);
    const mayView =
      role === "admin" ||
      (role === "teacher" && room.ownerTeacherId === caller.id) ||
      (role === "student" && this.isActivelyEnrolled(roomId, caller.id));
    if (!mayView) {
      throw new AppError("FORBIDDEN", 403, "You do not have access to this room.");
    }
  }

  /** Only the owning teacher may post room content (ROLE-009). */
  private requireOwnerTeacher(caller: AuthUser, room: RoomRow): void {
    const role = this.roleOf(caller.id);
    if (role !== "teacher" || room.ownerTeacherId !== caller.id) {
      throw new AppError("FORBIDDEN", 403, "You do not have access to this room.");
    }
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
