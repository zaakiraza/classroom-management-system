import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { hashPassword, TokenService, verifyPassword } from "../../common/auth";
import { AppError } from "../../common/errors";
import { DB, type Db } from "../../db/db.module";
import { users } from "../../db/schema";
import type { UserRow } from "../users/users.schemas";
import type { LoginInput, LoginResponse, SetPasswordInput } from "./auth.schemas";

/** Role-based landing route returned by login. */
const HOME_BY_ROLE: Record<UserRow["role"], string> = {
  admin: "/admin",
  teacher: "/rooms",
  student: "/rooms",
};

@Injectable()
export class AuthService {
  constructor(@Inject(DB) private readonly db: Db, private readonly tokens: TokenService) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    const row = this.db.select().from(users).where(eq(users.email, input.email)).get();
    if (!row?.passwordHash || !(await verifyPassword(input.password, row.passwordHash))) {
      throw new AppError("UNAUTHENTICATED", 401, "Invalid email or password");
    }
    return {
      accessToken: this.tokens.sign({ id: row.id }),
      role: row.role,
      home: HOME_BY_ROLE[row.role],
    };
  }

  async setPassword(input: SetPasswordInput): Promise<void> {
    const row = this.db
      .select()
      .from(users)
      .where(eq(users.setPasswordToken, input.token))
      .get();
    if (!row) {
      // A used token is cleared, so a token matching no account has already been spent.
      throw new AppError("VALIDATION_ERROR", 400, "This link has already been used.");
    }
    if (!row.setPasswordTokenExpiresAt || row.setPasswordTokenExpiresAt.getTime() <= Date.now()) {
      throw new AppError("VALIDATION_ERROR", 400, "This link has expired. Ask your administrator to resend it.");
    }
    this.db
      .update(users)
      .set({
        passwordHash: await hashPassword(input.password),
        setPasswordToken: null,
        setPasswordTokenExpiresAt: null,
      })
      .where(eq(users.id, row.id))
      .run();
  }
}
