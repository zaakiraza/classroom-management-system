import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  type CreateQuizInput,
  CreateQuizSchema,
  type QuizAttemptView,
  type QuizResponse,
  type QuizResultsResponse,
  type SaveAttemptInput,
  SaveAttemptSchema,
  type SaveAttemptResponse,
  type UpdateQuizInput,
  UpdateQuizSchema,
} from "./quizzes.schemas";
import { QuizzesService } from "./quizzes.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly service: QuizzesService) {}

  @Get("rooms/:id/quizzes")
  quizzes_list(@CurrentUser() user: AuthUser, @Param("id") id: string): QuizResponse[] {
    return this.service.list(user, id);
  }

  @Post("rooms/:id/quizzes")
  @HttpCode(201)
  quizzes_create(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(CreateQuizSchema)) body: CreateQuizInput,
  ): QuizResponse {
    return this.service.create(user, id, body);
  }

  @Patch("quizzes/:id")
  quizzes_update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateQuizSchema)) body: UpdateQuizInput,
  ): QuizResponse {
    return this.service.update(user, id, body);
  }

  @Get("quizzes/:id/results")
  quizzes_results(@CurrentUser() user: AuthUser, @Param("id") id: string): QuizResultsResponse {
    return this.service.results(user, id);
  }

  @Get("quizzes/:id/attempt")
  quizzes_attempt_get(@CurrentUser() user: AuthUser, @Param("id") id: string): QuizAttemptView {
    return this.service.getAttempt(user, id);
  }

  @Post("quizzes/:id/attempt")
  quizzes_attempt_save(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(SaveAttemptSchema)) body: SaveAttemptInput,
  ): SaveAttemptResponse {
    return this.service.saveAttempt(user, id, body);
  }
}
