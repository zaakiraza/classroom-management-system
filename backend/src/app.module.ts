import { Module, type Type } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AuthModule as CommonAuthModule } from "./common/auth";
import { AllExceptionsFilter } from "./common/errors";
import { DbModule } from "./db/db.module";
import { HealthModule } from "./health/health.module";
import { AnnouncementsModule } from "./modules/announcements/announcements.module";
import { AssignmentsModule } from "./modules/assignments/assignments.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { AuthModule } from "./modules/auth/auth.module";
import { EnrollmentModule } from "./modules/enrollment/enrollment.module";
import { GradebookModule } from "./modules/gradebook/gradebook.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { QuizzesModule } from "./modules/quizzes/quizzes.module";
import { ResultsModule } from "./modules/results/results.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { SubmissionsModule } from "./modules/submissions/submissions.module";
import { UsersModule } from "./modules/users/users.module";

/**
 * Feature modules, one per OpenAPI tag (`src/modules/<tag>/<tag>.module.ts`).
 * Add each new module here; the contract check only sees routes reachable from AppModule.
 */
export const FEATURE_MODULES: Type<unknown>[] = [
  AuthModule,
  UsersModule,
  RoomsModule,
  EnrollmentModule,
  AttendanceModule,
  AnnouncementsModule,
  AssignmentsModule,
  SubmissionsModule,
  QuizzesModule,
  GradebookModule,
  ResultsModule,
  NotificationsModule,
];

@Module({
  imports: [DbModule, CommonAuthModule, HealthModule, ...FEATURE_MODULES],
  // Registered as a provider (not only in main.ts) so tests built from AppModule get the same envelope.
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
