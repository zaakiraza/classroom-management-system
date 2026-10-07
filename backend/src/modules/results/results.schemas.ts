import { z } from "zod";
import { termResults } from "../../db/schema";

/** result_publish body: `term` and `publish` are both optional (preview vs publish). */
export const PublishResultSchema = z.object({
  term: z.string().min(1).optional(),
  publish: z.boolean().optional(),
});
export type PublishResultInput = z.infer<typeof PublishResultSchema>;

/** Per-student percentages and the class average, computed from graded work. */
export interface TermSummary {
  students: { studentId: string; percentage: number }[];
  classAverage: number;
}

/** TermResult as documented: `summary` is a JSON object, dates are ISO strings or null. */
export interface TermResultResponse {
  id: string;
  roomId: string;
  term: string;
  summary: Record<string, unknown>;
  publishedAt: string | null;
  lockedAt: string | null;
}

export type TermResultRow = typeof termResults.$inferSelect;

export function toTermResultResponse(row: TermResultRow): TermResultResponse {
  return {
    id: row.id,
    roomId: row.roomId,
    term: row.term,
    summary: parseSummary(row.summary),
    publishedAt: row.publishedAt !== null ? row.publishedAt.toISOString() : null,
    lockedAt: row.lockedAt !== null ? row.lockedAt.toISOString() : null,
  };
}

/** Stored summaries are JSON; seeded prose strings surface under a `note` key instead. */
function parseSummary(stored: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(stored);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // not JSON — fall through
  }
  return { note: stored };
}
