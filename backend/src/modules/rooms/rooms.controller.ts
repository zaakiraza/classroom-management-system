import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  type CreateRoomInput,
  CreateRoomSchema,
  type RoomResponse,
  type UpdateRoomInput,
  UpdateRoomSchema,
} from "./rooms.schemas";
import { RoomsService } from "./rooms.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get("rooms")
  rooms_list(@CurrentUser() user: AuthUser): RoomResponse[] {
    return this.service.list(user);
  }

  @Post("rooms")
  @HttpCode(201)
  rooms_create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateRoomSchema)) body: CreateRoomInput,
  ): RoomResponse {
    return this.service.create(user, body);
  }

  // Literal paths are declared before the :id route so "mine"/"enrolled" can never be captured as an id.
  @Get("rooms/mine")
  rooms_list_mine(@CurrentUser() user: AuthUser): RoomResponse[] {
    return this.service.listMine(user);
  }

  @Get("rooms/enrolled")
  rooms_list_enrolled(@CurrentUser() user: AuthUser): RoomResponse[] {
    return this.service.listEnrolled(user);
  }

  @Patch("rooms/:id")
  rooms_update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateRoomSchema)) body: UpdateRoomInput,
  ): RoomResponse {
    return this.service.update(user, id, body);
  }
}
