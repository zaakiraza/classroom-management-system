import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { announcements, enrollments, notifications, rooms, users } from "../../db/schema";
import type { RoomRow } from "../rooms/rooms.schemas";
import type { Role } from "../users/users.schemas";
import {
  type AnnouncementResponse,
  toAnnouncementResponse,
  type AnnouncementRow,
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
} from "./announcements.schemas";

/** The transaction handle passed to `db.transaction` callbacks. */
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

@Injectable()
export class AnnouncementsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  list(caller: AuthUser, roomId: string): AnnouncementResponse[] {
    this.authorizeViewer(caller, roomId);
    return this.db
      .select()
      .from(announcements)
      .where(eq(announcements.roomId, roomId))
      .orderBy(desc(announcements.createdAt))
      .all()
      .map(toAnnouncementResponse);
  }

  create(caller: AuthUser, roomId: string, input: CreateAnnouncementInput): AnnouncementResponse {
    const room = this.getRoom(roomId);
    this.requireOwnerTeacher(caller, room);
    return this.db.transaction((tx) => {
      const row: AnnouncementRow = tx
        .insert(announcements)
        .values({ roomId, authorId: caller.id, title: input.title, body: input.body })
        .returning()
        .all()[0];
      this.notifyEnrolled(
        tx,
        roomId,
        "announcementPosted",
        `New announcement in ${room.name}: "${input.title}"`,
        `/rooms/${roomId}/announcements`,
      );
      return toAnnouncementResponse(row);
    });
  }

  update(caller: AuthUser, id: string, input: UpdateAnnouncementInput): AnnouncementResponse {
    const announcement = this.getAnnouncement(id);
    if (announcement.authorId !== caller.id) {
      throw new AppError("FORBIDDEN", 403, "Only the authoring teacher can edit this announcement.");
    }
    const patch: Partial<typeof announcements.$inferInsert> = {};
    if (input.title !== undefined) {
      patch.title = input.title;
    }
    if (input.body !== undefined) {
      patch.body = input.body;
    }
    if (Object.keys(patch).length === 0) {
      return toAnnouncementResponse(announcement);
    }
    const row = this.db.update(announcements).set(patch).where(eq(announcements.id, id)).returning().all()[0];
    return toAnnouncementResponse(row);
  }

  delete(caller: AuthUser, id: string): void {
    const announcement = this.getAnnouncement(id);
    if (announcement.authorId !== caller.id) {
      throw new AppError("FORBIDDEN", 403, "Only the authoring teacher can delete this announcement.");
    }
    this.db.delete(announcements).where(eq(announcements.id, id)).run();
  }

  /** One in-app notification per actively enrolled student (STORY-007). */
  private notifyEnrolled(
    tx: Tx,
    roomId: string,
    type: "announcementPosted" | "assignmentPosted",
    message: string,
    link: string,
  ): void {
    const students = tx
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(and(eq(enrollments.roomId, roomId), isNull(enrollments.removedAt)))
      .all();
    if (students.length === 0) {
      return;
    }
    tx.insert(notifications)
      .values(students.map(({ studentId }) => ({ userId: studentId, type, message, link })))
      .run();
  }

  /** Admins read any room, teachers their own, students only while enrolled (STORY-007). */
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

  /** Only the owning teacher may post room content (ROLE-008). */
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

  private getAnnouncement(id: string): AnnouncementRow {
    const row = this.db.select().from(announcements).where(eq(announcements.id, id)).get();
    if (!row) {
      throw new AppError("NOT_FOUND", 404, "Announcement not found");
    }
    return row;
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
