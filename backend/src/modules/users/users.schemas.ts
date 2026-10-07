import { z } from "zod";
import { users } from "../../db/schema";

export const RoleSchema = z.enum(["admin", "teacher", "student"]);
export type Role = z.infer<typeof RoleSchema>;

export const UserStatusSchema = z.enum(["active", "pending", "deactivated"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const ListUsersQuerySchema = z.object({
  q: z.string().optional(),
  role: RoleSchema.optional(),
});
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  role: RoleSchema,
  enrollmentYear: z.number().int().optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  role: RoleSchema.optional(),
  status: UserStatusSchema.optional(),
  enrollmentYear: z.number().int().optional(),
  action: z.literal("resend-set-password").optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/** The documented response shape: exactly these fields, nothing internal. */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  enrollmentYear?: number;
  setPasswordTokenExpiresAt?: string;
}

export type UserRow = typeof users.$inferSelect;

/** Never expose passwordHash or the set-password token itself. */
export function toUserResponse(row: UserRow): UserResponse {
  const response: UserResponse = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
  };
  if (row.enrollmentYear !== null) {
    response.enrollmentYear = row.enrollmentYear;
  }
  if (row.setPasswordTokenExpiresAt !== null) {
    response.setPasswordTokenExpiresAt = row.setPasswordTokenExpiresAt.toISOString();
  }
  return response;
}
