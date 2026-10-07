import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  ListNotificationsQuerySchema,
  type MarkReadInput,
  MarkReadSchema,
  type NotificationsListResponse,
} from "./notifications.schemas";
import { NotificationsService } from "./notifications.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get("notifications")
  notifications_list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListNotificationsQuerySchema)) query: { unreadOnly: boolean },
  ): NotificationsListResponse {
    return this.service.list(user, query.unreadOnly);
  }

  @Post("notifications/read")
  @HttpCode(200)
  notifications_mark_read(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(MarkReadSchema)) body: MarkReadInput,
  ): { unreadCount: number } {
    return this.service.markRead(user, body);
  }
}
