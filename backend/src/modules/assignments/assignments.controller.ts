import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { type AssignmentResponse, type CreateAssignmentInput, CreateAssignmentSchema } from "./assignments.schemas";
import { AssignmentsService } from "./assignments.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  @Get("rooms/:id/assignments")
  assignments_list(@CurrentUser() user: AuthUser, @Param("id") id: string): AssignmentResponse[] {
    return this.service.list(user, id);
  }

  @Post("rooms/:id/assignments")
  @HttpCode(201)
  assignments_create(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(CreateAssignmentSchema)) body: CreateAssignmentInput,
  ): AssignmentResponse {
    return this.service.create(user, id, body);
  }
}
