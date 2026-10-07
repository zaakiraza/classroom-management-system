import { z } from "zod";
import { quizOptions, quizQuestions, quizzes } from "../../db/schema";

/** `format: date-time` → ISO 8601 string. */
const DateTimeString = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Expected a date-time");

const QuizOptionInputSchema = z.object({
  text: z.string().trim().min(1),
  isCorrect: z.boolean(),
});
export type QuizOptionInput = z.infer<typeof QuizOptionInputSchema>;

const QuizQuestionInputSchema = z.object({
  prompt: z.string().trim().min(1),
  points: z.number().positive(),
  // No minItems: an option-less or multi-correct question is rejected in the service with the
  // STORY-011 message ("Select a correct option"), not with generic validation details.
  options: z.array(QuizOptionInputSchema),
});
export type QuizQuestionInput = z.infer<typeof QuizQuestionInputSchema>;

export const CreateQuizSchema = z.object({
  title: z.string().trim().min(1),
  opensAt: DateTimeString.optional(),
  closesAt: DateTimeString,
  questions: z.array(QuizQuestionInputSchema).min(1),
});
export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;

/** QuizUpdate: every field optional; date-times may be cleared with null. */
export const UpdateQuizSchema = z.object({
  title: z.string().trim().min(1).optional(),
  opensAt: DateTimeString.nullable().optional(),
  closesAt: DateTimeString.optional(),
  publishedAt: DateTimeString.nullable().optional(),
  questions: z.array(QuizQuestionInputSchema).optional(),
});
export type UpdateQuizInput = z.infer<typeof UpdateQuizSchema>;

export const SaveAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      optionId: z.string().min(1),
    }),
  ),
  submit: z.boolean().default(false),
});
export type SaveAttemptInput = z.infer<typeof SaveAttemptSchema>;

/** QuizOption as documented: id and text only — `isCorrect` never leaves the server. */
export interface QuizOptionResponse {
  id: string;
  text: string;
}

export interface QuizQuestionResponse {
  id: string;
  prompt: string;
  points: number;
  options: QuizOptionResponse[];
}

export interface QuizResponse {
  id: string;
  roomId: string;
  title: string;
  opensAt: string | null;
  closesAt: string;
  publishedAt: string | null;
  questions: QuizQuestionResponse[];
}

export interface AttemptAnswer {
  questionId: string;
  optionId: string;
}

export interface PerQuestionResult {
  questionId: string;
  chosenOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
}

/** GET /quizzes/{id}/attempt response: the quiz plus the caller's optional attempt. */
export interface QuizAttemptView {
  quiz: QuizResponse;
  attempt?: {
    status: "in_progress" | "submitted";
    answers: AttemptAnswer[];
    score: number | null;
    submittedAt: string | null;
    /** Revealed only once the attempt is submitted (STORY-012). */
    perQuestion?: PerQuestionResult[];
  };
}

/** POST /quizzes/{id}/attempt response (oneOf): either saved as in_progress or scored. */
export type SaveAttemptResponse = { status: "in_progress" } | { score: number; perQuestion: PerQuestionResult[] };

/** GET /quizzes/{id}/results response. */
export interface QuizResultsResponse {
  attempts: { studentId: string; status: "in_progress" | "submitted"; score: number | null }[];
  distribution: { questionId: string; optionId: string; count: number }[];
}

export type QuizRow = typeof quizzes.$inferSelect;
export type QuizQuestionRow = typeof quizQuestions.$inferSelect;
export type QuizOptionRow = typeof quizOptions.$inferSelect;

/** A question with its options as loaded for responses and scoring. */
export interface LoadedQuestion {
  id: string;
  prompt: string;
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}
