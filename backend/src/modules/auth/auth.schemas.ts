import { z } from "zod";
import { type Role } from "../users/users.schemas";

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

/** The contract enforces minLength 8 on the new password (STORY-002). */
export const SetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});
export type SetPasswordInput = z.infer<typeof SetPasswordSchema>;

export interface LoginResponse {
  accessToken: string;
  role: Role;
  home: string;
}
