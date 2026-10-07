import { z } from "zod";
import { announcements } from "../../db/schema";

export const CreateAnnouncementSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
});
export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;

export const UpdateAnnouncementSchema = z.object({
  title: z.string().trim().min(1).optional(),
  body: z.string().trim().min(1).optional(),
});
export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementSchema>;

/** The documented response shape: exactly these fields, nothing internal. */
export interface AnnouncementResponse {
  id: string;
  roomId: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
}

export type AnnouncementRow = typeof announcements.$inferSelect;

export function toAnnouncementResponse(row: AnnouncementRow): AnnouncementResponse {
  return {
    id: row.id,
    roomId: row.roomId,
    authorId: row.authorId,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt !== null ? row.updatedAt.toISOString() : null,
  };
}
