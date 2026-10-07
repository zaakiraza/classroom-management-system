import { z } from "zod";
import { notifications } from "../../db/schema";

/** Express delivers query params as strings; only "true"/"false" are meaningful here. */
export const ListNotificationsQuerySchema = z.object({
  unreadOnly: z.enum(["true", "false"]).optional().transform((value) => value === "true"),
});
export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuerySchema>;

/** Mark specific notifications read via `ids`; omit it (or send an empty list) to mark all. */
export const MarkReadSchema = z.object({
  ids: z.array(z.string().min(1)).optional(),
});
export type MarkReadInput = z.infer<typeof MarkReadSchema>;

/** Notification as documented: exactly these fields, nothing internal. */
export interface NotificationResponse {
  id: string;
  type: NotificationRow["type"];
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export type NotificationRow = typeof notifications.$inferSelect;

export function toNotificationResponse(row: NotificationRow): NotificationResponse {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    link: row.link,
    readAt: row.readAt !== null ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

/** GET /notifications response. */
export interface NotificationsListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
}
