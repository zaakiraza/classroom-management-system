import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { type LoginInput, LoginResponse, LoginSchema, type SetPasswordInput, SetPasswordSchema } from "./auth.schemas";
import { AuthService } from "./auth.service";

/** Both operations are `security: []` in the contract — no guard on purpose. */
@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post("login")
  @HttpCode(200)
  auth_login(@Body(new ZodValidationPipe(LoginSchema)) body: LoginInput): Promise<LoginResponse> {
    return this.service.login(body);
  }

  @Post("set-password")
  @HttpCode(200)
  async auth_set_password(
    @Body(new ZodValidationPipe(SetPasswordSchema)) body: SetPasswordInput,
  ): Promise<{ message: string }> {
    await this.service.setPassword(body);
    return { message: "Password set" };
  }
}
