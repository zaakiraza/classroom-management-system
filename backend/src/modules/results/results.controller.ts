import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser, JwtAuthGuard } from "../../common/auth";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { type PublishResultInput, PublishResultSchema, type TermResultResponse } from "./results.schemas";
import { ResultsService } from "./results.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly service: ResultsService) {}

  @Get("rooms/:id/result")
  result_get(@CurrentUser() user: AuthUser, @Param("id") id: string): TermResultResponse {
    return this.service.get(user, id);
  }

  @Put("rooms/:id/result")
  result_publish(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(PublishResultSchema)) body: PublishResultInput,
  ): TermResultResponse {
    return this.service.publish(user, id, body);
  }
}
