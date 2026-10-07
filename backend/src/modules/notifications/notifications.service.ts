import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { type AuthUser } from "../../common/auth";
import { DB, type Db } from "../../db/db.module";
import { notifications } from "../../db/schema";
import {
  type MarkReadInput,
  type NotificationsListResponse,
  toNotificationResponse,
} from "./notifications.schemas";

@Injectable()
export class NotificationsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** STORY-015: the caller's notifications, newest first, with the total unread count. */
  list(caller: AuthUser, unreadOnly: boolean): NotificationsListResponse {
    const conditions = [eq(notifications.userId, caller.id)];
    if (unreadOnly) {
      conditions.push(isNull(notifications.readAt));
    }
    const rows = this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .all();
    return { notifications: rows.map(toNotificationResponse), unreadCount: this.unreadCount(caller.id) };
  }

  /** STORY-015: mark specific ids (own only) read, or everything when no ids are given. */
  markRead(caller: AuthUser, input: MarkReadInput): { unreadCount: number } {
    const conditions = [eq(notifications.userId, caller.id), isNull(notifications.readAt)];
    if (input.ids && input.ids.length > 0) {
      conditions.push(inArray(notifications.id, input.ids));
    }
    this.db.update(notifications).set({ readAt: new Date() }).where(and(...conditions)).run();
    return { unreadCount: this.unreadCount(caller.id) };
  }

  private unreadCount(userId: string): number {
    return (
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
        .get()?.count ?? 0
    );
  }
}
