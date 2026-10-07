import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  type GetSubmissionQuery,
  GetSubmissionQuerySchema,
  type GradeSubmissionInput,
  GradeSubmissionSchema,
  type SubmissionResponse,
  type UploadedFile as SubmissionFile,
} from "./submissions.schemas";
import { SubmissionsService } from "./submissions.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly service: SubmissionsService) {}

  // No multer fileSize limit: an over-limit file must surface as the documented 400 message
  // (STORY-009), not multer's 413; the 20 MB cap is enforced in the service.
  @Post("assignments/:id/submission")
  @UseInterceptors(FileInterceptor("file"))
  @HttpCode(201)
  submissions_upload(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @UploadedFile() file?: SubmissionFile,
  ): SubmissionResponse {
    return this.service.upload(user, id, file);
  }

  @Get("assignments/:id/submission")
  submissions_get_mine(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Query(new ZodValidationPipe(GetSubmissionQuerySchema)) query: GetSubmissionQuery,
  ): SubmissionResponse {
    return this.service.getMine(user, id, query);
  }

  @Get("assignments/:id/submissions")
  submissions_list(@CurrentUser() user: AuthUser, @Param("id") id: string): SubmissionResponse[] {
    return this.service.list(user, id);
  }

  @Patch("submissions/:id/grade")
  submissions_grade(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(GradeSubmissionSchema)) body: GradeSubmissionInput,
  ): SubmissionResponse {
    return this.service.grade(user, id, body);
  }
}
