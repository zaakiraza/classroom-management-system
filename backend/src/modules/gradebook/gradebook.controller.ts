import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { type MyGradebook, type StudentGradebook } from "./gradebook.schemas";
import { GradebookService } from "./gradebook.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class GradebookController {
  constructor(private readonly service: GradebookService) {}

  @Get("rooms/:id/gradebook")
  gradebook_get(@CurrentUser() user: AuthUser, @Param("id") id: string): StudentGradebook[] {
    return this.service.get(user, id);
  }

  @Get("rooms/:id/gradebook/me")
  gradebook_me(@CurrentUser() user: AuthUser, @Param("id") id: string): MyGradebook {
    return this.service.me(user, id);
  }
}
