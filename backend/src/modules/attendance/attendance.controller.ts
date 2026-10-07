import { Body, Controller, Get, Param, Put, Query, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  type AttendanceMeResponse,
  type AttendanceRecordResponse,
  type GetAttendanceQuery,
  GetAttendanceQuerySchema,
  type UpsertAttendanceInput,
  UpsertAttendanceSchema,
} from "./attendance.schemas";
import { AttendanceService } from "./attendance.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get("rooms/:id/attendance/me")
  attendance_me(@CurrentUser() user: AuthUser, @Param("id") id: string): AttendanceMeResponse {
    return this.service.me(user, id);
  }

  @Get("rooms/:id/attendance")
  attendance_get(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Query(new ZodValidationPipe(GetAttendanceQuerySchema)) query: GetAttendanceQuery,
  ): { record: AttendanceRecordResponse | null } {
    return this.service.get(user, id, query.date);
  }

  @Put("rooms/:id/attendance")
  attendance_upsert(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpsertAttendanceSchema)) body: UpsertAttendanceInput,
  ): AttendanceRecordResponse {
    return this.service.upsert(user, id, body);
  }
}
