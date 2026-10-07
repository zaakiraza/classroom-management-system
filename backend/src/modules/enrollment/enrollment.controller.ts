import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { type EnrollStudentInput, EnrollStudentSchema, type EnrollmentResponse } from "./enrollment.schemas";
import { EnrollmentService } from "./enrollment.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly service: EnrollmentService) {}

  @Get("rooms/:id/students")
  rooms_students_list(@CurrentUser() user: AuthUser, @Param("id") id: string): EnrollmentResponse[] {
    return this.service.list(user, id);
  }

  @Post("rooms/:id/students")
  @HttpCode(201)
  rooms_students_enroll(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(EnrollStudentSchema)) body: EnrollStudentInput,
  ): EnrollmentResponse {
    return this.service.enroll(user, id, body);
  }

  @Delete("rooms/:id/students/:studentId")
  @HttpCode(204)
  rooms_students_remove(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Param("studentId") studentId: string,
  ): void {
    this.service.remove(user, id, studentId);
  }
}
