import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, like, or, type SQL } from "drizzle-orm";
import { type AuthUser, requireRole } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { users } from "../../db/schema";
import {
  type CreateUserInput,
  type ListUsersQuery,
  toUserResponse,
  type UpdateUserInput,
  type UserResponse,
  type UserRow,
} from "./users.schemas";

/** A provisioned set-password link stays valid for 72 hours (STORY-001). */
const SET_PASSWORD_TTL_MS = 72 * 60 * 60 * 1000;

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: Db) {}

  list(caller: AuthUser, query: ListUsersQuery): UserResponse[] {
    this.requireAdmin(caller);
    const filters: SQL[] = [];
    if (query.q) {
      filters.push(or(like(users.name, `%${query.q}%`), like(users.email, `%${query.q}%`))!);
    }
    if (query.role) {
      filters.push(eq(users.role, query.role));
    }
    const rows = this.db
      .select()
      .from(users)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(asc(users.createdAt))
      .all();
    return rows.map(toUserResponse);
  }

  create(caller: AuthUser, input: CreateUserInput): UserResponse {
    this.requireAdmin(caller);
    this.requireFreeEmail(input.email);
    const [row] = this.db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        role: input.role,
        status: "pending",
        enrollmentYear: input.enrollmentYear ?? null,
        setPasswordToken: crypto.randomUUID(),
        setPasswordTokenExpiresAt: new Date(Date.now() + SET_PASSWORD_TTL_MS),
      })
      .returning()
      .all();
    return toUserResponse(row);
  }

  update(caller: AuthUser, id: string, input: UpdateUserInput): UserResponse {
    this.requireAdmin(caller);
    const row = this.getUser(id);
    if (input.email !== undefined && input.email !== row.email) {
      this.requireFreeEmail(input.email);
    }
    const patch: Partial<typeof users.$inferInsert> = {};
    if (input.name !== undefined) {
      patch.name = input.name;
    }
    if (input.email !== undefined) {
      patch.email = input.email;
    }
    if (input.role !== undefined) {
      patch.role = input.role;
    }
    if (input.status !== undefined) {
      patch.status = input.status;
    }
    if (input.enrollmentYear !== undefined) {
      patch.enrollmentYear = input.enrollmentYear;
    }
    if (input.action === "resend-set-password") {
      // A resend invalidates the outstanding token and issues a fresh 72h link.
      patch.setPasswordToken = crypto.randomUUID();
      patch.setPasswordTokenExpiresAt = new Date(Date.now() + SET_PASSWORD_TTL_MS);
    }
    if (Object.keys(patch).length === 0) {
      return toUserResponse(row);
    }
    const [updated] = this.db.update(users).set(patch).where(eq(users.id, id)).returning().all();
    return toUserResponse(updated);
  }

  private getUser(id: string): UserRow {
    const row = this.db.select().from(users).where(eq(users.id, id)).get();
    if (!row) {
      throw new AppError("NOT_FOUND", 404, "User not found");
    }
    return row;
  }

  private requireFreeEmail(email: string): void {
    const existing = this.db.select({ id: users.id }).from(users).where(eq(users.email, email)).get();
    if (existing) {
      throw new AppError("CONFLICT", 409, "An account with this email already exists.");
    }
  }

  private requireAdmin(caller: AuthUser): void {
    const role = this.db.select({ role: users.role }).from(users).where(eq(users.id, caller.id)).get()?.role;
    requireRole(role, ["admin"], "manage accounts");
  }
}
