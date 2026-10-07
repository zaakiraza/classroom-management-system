import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, isNull } from "drizzle-orm";
import { type AuthUser, requireRole } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { enrollments, rooms, users } from "../../db/schema";
import {
  type CreateRoomInput,
  type RoomResponse,
  type RoomRow,
  type UpdateRoomInput,
  parseDate,
  toRoomResponse,
} from "./rooms.schemas";

@Injectable()
export class RoomsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  list(caller: AuthUser): RoomResponse[] {
    this.requireAdmin(caller);
    return this.db
      .select()
      .from(rooms)
      .orderBy(asc(rooms.createdAt))
      .all()
      .map(toRoomResponse);
  }

  create(caller: AuthUser, input: CreateRoomInput): RoomResponse {
    this.requireAdmin(caller);
    this.requireTeacher(input.ownerTeacherId);
    const [row] = this.db
      .insert(rooms)
      .values({
        name: input.name,
        ownerTeacherId: input.ownerTeacherId,
        termCloseDate: input.termCloseDate !== undefined ? parseDate(input.termCloseDate) : null,
      })
      .returning()
      .all();
    return toRoomResponse(row);
  }

  listMine(caller: AuthUser): RoomResponse[] {
    this.requireRoleOf(caller, "teacher", "list their rooms");
    return this.db
      .select()
      .from(rooms)
      .where(eq(rooms.ownerTeacherId, caller.id))
      .orderBy(asc(rooms.createdAt))
      .all()
      .map(toRoomResponse);
  }

  listEnrolled(caller: AuthUser): RoomResponse[] {
    this.requireRoleOf(caller, "student", "list enrolled rooms");
    const rows = this.db
      .select({ room: rooms })
      .from(rooms)
      .innerJoin(enrollments, eq(enrollments.roomId, rooms.id))
      .where(and(eq(enrollments.studentId, caller.id), isNull(enrollments.removedAt)))
      .orderBy(asc(rooms.createdAt))
      .all();
    return rows.map(({ room }) => toRoomResponse(room));
  }

  update(caller: AuthUser, id: string, input: UpdateRoomInput): RoomResponse {
    this.requireAdmin(caller);
    const row = this.getRoom(id);
    if (input.ownerTeacherId !== undefined) {
      this.requireTeacher(input.ownerTeacherId);
    }
    const patch: Partial<typeof rooms.$inferInsert> = {};
    if (input.name !== undefined) {
      patch.name = input.name;
    }
    if (input.ownerTeacherId !== undefined) {
      patch.ownerTeacherId = input.ownerTeacherId;
    }
    if (input.status !== undefined) {
      patch.status = input.status;
    }
    if (input.termCloseDate !== undefined) {
      patch.termCloseDate = input.termCloseDate === null ? null : parseDate(input.termCloseDate);
    }
    if (Object.keys(patch).length === 0) {
      return toRoomResponse(row);
    }
    const [updated] = this.db.update(rooms).set(patch).where(eq(rooms.id, id)).returning().all();
    return toRoomResponse(updated);
  }

  private getRoom(id: string): RoomRow {
    const row = this.db.select().from(rooms).where(eq(rooms.id, id)).get();
    if (!row) {
      throw new AppError("NOT_FOUND", 404, "Room not found");
    }
    return row;
  }

  private requireTeacher(id: string): void {
    const row = this.db.select({ role: users.role }).from(users).where(eq(users.id, id)).get();
    if (!row || row.role !== "teacher") {
      throw new AppError("VALIDATION_ERROR", 400, "Select an owning teacher");
    }
  }

  private requireAdmin(caller: AuthUser): void {
    const role = this.db.select({ role: users.role }).from(users).where(eq(users.id, caller.id)).get()?.role;
    requireRole(role, ["admin"], "manage rooms");
  }

  private requireRoleOf(caller: AuthUser, role: "teacher" | "student", action: string): void {
    const actual = this.db.select({ role: users.role }).from(users).where(eq(users.id, caller.id)).get()?.role;
    requireRole(actual, [role], action);
  }
}
