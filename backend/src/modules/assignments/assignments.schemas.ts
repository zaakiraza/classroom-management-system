import { z } from "zod";
import { assignments } from "../../db/schema";

/** `format: date-time` → ISO 8601 string. */
const DateTimeString = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Expected a date-time");

export const CreateAssignmentSchema = z.object({
  title: z.string().trim().min(1),
  instructions: z.string().trim().min(1),
  // STORY-008: a past due date is rejected inline.
  dueAt: DateTimeString.refine((value) => new Date(value).getTime() > Date.now(), "Due date must be in the future"),
  totalPoints: z.number().positive(),
});
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;

/** The documented response shape: exactly these fields, nothing internal. */
export interface AssignmentResponse {
  id: string;
  roomId: string;
  title: string;
  instructions: string;
  dueAt: string;
  totalPoints: number;
}

export type AssignmentRow = typeof assignments.$inferSelect;

export function toAssignmentResponse(row: AssignmentRow): AssignmentResponse {
  return {
    id: row.id,
    roomId: row.roomId,
    title: row.title,
    instructions: row.instructions,
    dueAt: row.dueAt.toISOString(),
    totalPoints: row.totalPoints,
  };
}
