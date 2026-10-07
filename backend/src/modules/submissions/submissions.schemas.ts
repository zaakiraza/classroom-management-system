import { z } from "zod";
import { submissions } from "../../db/schema";

/**
 * Multipart file as delivered by the multer interceptor (`@types/multer` is not installed, so the
 * shape is declared here).
 */
export type UploadedFile = { originalname: string; mimetype: string; size: number; buffer: Buffer };

/** STORY-009: .pdf/.png/.jpg/.doc/.docx up to 20 MB; anything else is rejected with this message. */
export const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".doc", ".docx"] as const;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const FILE_REJECTED_MESSAGE = "File rejected: use a PDF, PNG, JPG, DOC, or DOCX file up to 20 MB.";

/** Teacher/admin target a specific student's submission; students may only read their own. */
export const GetSubmissionQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
});
export type GetSubmissionQuery = z.infer<typeof GetSubmissionQuerySchema>;

/** Range checks live in the service so the STORY-010 message can name the assignment's total. */
export const GradeSubmissionSchema = z.object({
  gradePoints: z.number(),
  gradeComment: z.string().optional(),
});
export type GradeSubmissionInput = z.infer<typeof GradeSubmissionSchema>;

/** The documented response shape: exactly these fields, nothing internal. */
export interface SubmissionResponse {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
  submittedAt: string;
  isLate: boolean;
  gradePoints: number | null;
  gradeComment: string | null;
  gradedAt: string | null;
}

export type SubmissionRow = typeof submissions.$inferSelect;

export function toSubmissionResponse(row: SubmissionRow): SubmissionResponse {
  return {
    id: row.id,
    assignmentId: row.assignmentId,
    studentId: row.studentId,
    fileUrl: row.fileUrl,
    submittedAt: row.submittedAt.toISOString(),
    isLate: row.isLate,
    gradePoints: row.gradePoints,
    gradeComment: row.gradeComment,
    gradedAt: row.gradedAt?.toISOString() ?? null,
  };
}
