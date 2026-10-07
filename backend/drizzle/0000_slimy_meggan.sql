CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`author_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `announcements_room_id_idx` ON `announcements` (`room_id`);--> statement-breakpoint
CREATE INDEX `announcements_author_id_idx` ON `announcements` (`author_id`);--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`title` text NOT NULL,
	`instructions` text NOT NULL,
	`due_at` integer NOT NULL,
	`total_points` real NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assignments_room_id_idx` ON `assignments` (`room_id`);--> statement-breakpoint
CREATE TABLE `attendance_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`attendance_record_id` text NOT NULL,
	`student_id` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`attendance_record_id`) REFERENCES `attendance_records`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_entries_attendance_record_id_student_id_unique` ON `attendance_entries` (`attendance_record_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `attendance_entries_student_id_idx` ON `attendance_entries` (`student_id`);--> statement-breakpoint
CREATE TABLE `attendance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_records_room_id_date_unique` ON `attendance_records` (`room_id`,`date`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`student_id` text NOT NULL,
	`enrolled_at` integer NOT NULL,
	`removed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollments_room_id_student_id_unique` ON `enrollments` (`room_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `enrollments_student_id_idx` ON `enrollments` (`student_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`link` text,
	`read_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`student_id` text NOT NULL,
	`status` text NOT NULL,
	`answers` text NOT NULL,
	`score` real,
	`submitted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quiz_attempts_quiz_id_student_id_unique` ON `quiz_attempts` (`quiz_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_student_id_idx` ON `quiz_attempts` (`student_id`);--> statement-breakpoint
CREATE TABLE `quiz_options` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`text` text NOT NULL,
	`is_correct` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quiz_options_question_id_idx` ON `quiz_options` (`question_id`);--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`prompt` text NOT NULL,
	`points` real NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quiz_questions_quiz_id_idx` ON `quiz_questions` (`quiz_id`);--> statement-breakpoint
CREATE TABLE `quizes` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`title` text NOT NULL,
	`opens_at` integer,
	`closes_at` integer NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quizzes_room_id_idx` ON `quizes` (`room_id`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`owner_teacher_id` text NOT NULL,
	`term_close_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_teacher_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rooms_owner_teacher_id_idx` ON `rooms` (`owner_teacher_id`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`student_id` text NOT NULL,
	`file_url` text NOT NULL,
	`submitted_at` integer NOT NULL,
	`is_late` integer NOT NULL,
	`grade_points` real,
	`grade_comment` text,
	`graded_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_assignment_id_student_id_unique` ON `submissions` (`assignment_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `submissions_student_id_idx` ON `submissions` (`student_id`);--> statement-breakpoint
CREATE TABLE `term_results` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`term` text NOT NULL,
	`summary` text NOT NULL,
	`published_at` integer,
	`locked_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `term_results_room_id_term_unique` ON `term_results` (`room_id`,`term`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`password_hash` text,
	`set_password_token` text,
	`set_password_token_expires_at` integer,
	`enrollment_year` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);