import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  type AnnouncementResponse,
  type CreateAnnouncementInput,
  CreateAnnouncementSchema,
  type UpdateAnnouncementInput,
  UpdateAnnouncementSchema,
} from "./announcements.schemas";
import { AnnouncementsService } from "./announcements.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Get("rooms/:id/announcements")
  announcements_list(@CurrentUser() user: AuthUser, @Param("id") id: string): AnnouncementResponse[] {
    return this.service.list(user, id);
  }

  @Post("rooms/:id/announcements")
  @HttpCode(201)
  announcements_create(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(CreateAnnouncementSchema)) body: CreateAnnouncementInput,
  ): AnnouncementResponse {
    return this.service.create(user, id, body);
  }

  @Patch("announcements/:id")
  announcements_update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateAnnouncementSchema)) body: UpdateAnnouncementInput,
  ): AnnouncementResponse {
    return this.service.update(user, id, body);
  }

  @Delete("announcements/:id")
  @HttpCode(204)
  announcements_delete(@CurrentUser() user: AuthUser, @Param("id") id: string): void {
    this.service.delete(user, id);
  }
}
