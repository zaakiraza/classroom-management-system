import { z } from "zod";
import { rooms } from "../../db/schema";

/** `format: date` → YYYY-MM-DD. */
const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date as YYYY-MM-DD");

export const RoomStatusSchema = z.enum(["active", "deactivated"]);
export type RoomStatus = z.infer<typeof RoomStatusSchema>;

export const CreateRoomSchema = z.object({
  name: z.string().trim().min(1),
  ownerTeacherId: z.string().trim().min(1),
  termCloseDate: DateString.optional(),
});
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

export const UpdateRoomSchema = z.object({
  name: z.string().trim().min(1).optional(),
  ownerTeacherId: z.string().trim().min(1).optional(),
  status: RoomStatusSchema.optional(),
  termCloseDate: DateString.nullable().optional(),
});
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;

/** The documented response shape: exactly these fields, nothing internal. */
export interface RoomResponse {
  id: string;
  name: string;
  status: RoomStatus;
  ownerTeacherId: string;
  termCloseDate?: string;
}

export type RoomRow = typeof rooms.$inferSelect;

/** Parse a YYYY-MM-DD string into a UTC-midnight Date so it round-trips losslessly. */
export function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toRoomResponse(row: RoomRow): RoomResponse {
  const response: RoomResponse = {
    id: row.id,
    name: row.name,
    status: row.status,
    ownerTeacherId: row.ownerTeacherId,
  };
  if (row.termCloseDate !== null) {
    response.termCloseDate = row.termCloseDate.toISOString().slice(0, 10);
  }
  return response;
}
