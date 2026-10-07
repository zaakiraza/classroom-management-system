import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  CreateUserSchema,
  type CreateUserInput,
  ListUsersQuerySchema,
  type ListUsersQuery,
  type UpdateUserInput,
  UpdateUserSchema,
  type UserResponse,
} from "./users.schemas";
import { UsersService } from "./users.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get("users")
  users_list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListUsersQuerySchema)) query: ListUsersQuery,
  ): UserResponse[] {
    return this.service.list(user, query);
  }

  @Post("users")
  @HttpCode(201)
  users_create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserInput,
  ): UserResponse {
    return this.service.create(user, body);
  }

  @Patch("users/:id")
  users_update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) body: UpdateUserInput,
  ): UserResponse {
    return this.service.update(user, id, body);
  }
}
