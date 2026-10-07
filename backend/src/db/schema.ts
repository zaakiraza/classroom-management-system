/**
 * Drizzle tables, translated from contract/schema.prisma (skill: drizzle-rules).
 */
import { relations } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "teacher", "student"] }).notNull(),
  status: text("status", { enum: ["active", "pending", "deactivated"] })
    .notNull()
    .$defaultFn(() => "pending"),
  passwordHash: text("password_hash"),
  setPasswordToken: text("set_password_token"),
  setPasswordTokenExpiresAt: integer("set_password_token_expires_at", { mode: "timestamp" }),
  enrollmentYear: integer("enrollment_year"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const rooms = sqliteTable(
  "rooms",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    status: text("status", { enum: ["active", "deactivated"] })
      .notNull()
      .$defaultFn(() => "active"),
    ownerTeacherId: text("owner_teacher_id")
      .notNull()
      .references(() => users.id),
    termCloseDate: integer("term_close_date", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [index("rooms_owner_teacher_id_idx").on(table.ownerTeacherId)],
);

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id),
    enrolledAt: integer("enrolled_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    removedAt: integer("removed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("enrollments_room_id_student_id_unique").on(table.roomId, table.studentId),
    index("enrollments_student_id_idx").on(table.studentId),
  ],
);

export const attendanceRecords = sqliteTable(
  "attendance_records",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    date: integer("date", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("attendance_records_room_id_date_unique").on(table.roomId, table.date)],
);

export const attendanceEntries = sqliteTable(
  "attendance_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    attendanceRecordId: text("attendance_record_id")
      .notNull()
      .references(() => attendanceRecords.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id),
    status: text("status", { enum: ["present", "absent", "late"] }).notNull(),
  },
  (table) => [
    uniqueIndex("attendance_entries_attendance_record_id_student_id_unique").on(
      table.attendanceRecordId,
      table.studentId,
    ),
    index("attendance_entries_student_id_idx").on(table.studentId),
  ],
);

export const announcements = sqliteTable(
  "announcements",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("announcements_room_id_idx").on(table.roomId),
    index("announcements_author_id_idx").on(table.authorId),
  ],
);

export const assignments = sqliteTable(
  "assignments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    instructions: text("instructions").notNull(),
    dueAt: integer("due_at", { mode: "timestamp" }).notNull(),
    totalPoints: real("total_points").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [index("assignments_room_id_idx").on(table.roomId)],
);

export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id),
    fileUrl: text("file_url").notNull(),
    submittedAt: integer("submitted_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    isLate: integer("is_late", { mode: "boolean" }).notNull(),
    gradePoints: real("grade_points"),
    gradeComment: text("grade_comment"),
    gradedAt: integer("graded_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("submissions_assignment_id_student_id_unique").on(table.assignmentId, table.studentId),
    index("submissions_student_id_idx").on(table.studentId),
  ],
);

export const quizzes = sqliteTable(
  "quizes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    opensAt: integer("opens_at", { mode: "timestamp" }),
    closesAt: integer("closes_at", { mode: "timestamp" }).notNull(),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [index("quizzes_room_id_idx").on(table.roomId)],
);

export const quizQuestions = sqliteTable(
  "quiz_questions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    points: real("points").notNull(),
  },
  (table) => [index("quiz_questions_quiz_id_idx").on(table.quizId)],
);

export const quizOptions = sqliteTable(
  "quiz_options",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    questionId: text("question_id")
      .notNull()
      .references(() => quizQuestions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  },
  (table) => [index("quiz_options_question_id_idx").on(table.questionId)],
);

export const quizAttempts = sqliteTable(
  "quiz_attempts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id),
    status: text("status", { enum: ["in_progress", "submitted"] })
      .notNull()
      .$defaultFn(() => "in_progress"),
    answers: text("answers").notNull(),
    score: real("score"),
    submittedAt: integer("submitted_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("quiz_attempts_quiz_id_student_id_unique").on(table.quizId, table.studentId),
    index("quiz_attempts_student_id_idx").on(table.studentId),
  ],
);

export const termResults = sqliteTable(
  "term_results",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    term: text("term").notNull(),
    summary: text("summary").notNull(),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    lockedAt: integer("locked_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("term_results_room_id_term_unique").on(table.roomId, table.term)],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "assignmentPosted",
        "quizPosted",
        "announcementPosted",
        "resultPublished",
        "assignmentGraded",
        "quizScored",
      ],
    }).notNull(),
    message: text("message").notNull(),
    link: text("link"),
    readAt: integer("read_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("notifications_user_id_idx").on(table.userId)],
);

export const usersRelations = relations(users, ({ many }) => ({
  ownedRooms: many(rooms, { relationName: "RoomOwner" }),
  enrollments: many(enrollments),
  attendanceEntries: many(attendanceEntries),
  announcements: many(announcements),
  submissions: many(submissions),
  quizAttempts: many(quizAttempts),
  notifications: many(notifications),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  owner: one(users, {
    fields: [rooms.ownerTeacherId],
    references: [users.id],
    relationName: "RoomOwner",
  }),
  enrollments: many(enrollments),
  attendanceRecords: many(attendanceRecords),
  announcements: many(announcements),
  assignments: many(assignments),
  quizzes: many(quizzes),
  termResults: many(termResults),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  room: one(rooms, { fields: [enrollments.roomId], references: [rooms.id] }),
  student: one(users, { fields: [enrollments.studentId], references: [users.id] }),
}));

export const attendanceRecordsRelations = relations(attendanceRecords, ({ one, many }) => ({
  room: one(rooms, { fields: [attendanceRecords.roomId], references: [rooms.id] }),
  entries: many(attendanceEntries),
}));

export const attendanceEntriesRelations = relations(attendanceEntries, ({ one }) => ({
  attendanceRecord: one(attendanceRecords, {
    fields: [attendanceEntries.attendanceRecordId],
    references: [attendanceRecords.id],
  }),
  student: one(users, { fields: [attendanceEntries.studentId], references: [users.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  room: one(rooms, { fields: [announcements.roomId], references: [rooms.id] }),
  author: one(users, { fields: [announcements.authorId], references: [users.id] }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  room: one(rooms, { fields: [assignments.roomId], references: [rooms.id] }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, { fields: [submissions.assignmentId], references: [assignments.id] }),
  student: one(users, { fields: [submissions.studentId], references: [users.id] }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  room: one(rooms, { fields: [quizzes.roomId], references: [rooms.id] }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [quizQuestions.quizId], references: [quizzes.id] }),
  options: many(quizOptions),
}));

export const quizOptionsRelations = relations(quizOptions, ({ one }) => ({
  question: one(quizQuestions, { fields: [quizOptions.questionId], references: [quizQuestions.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  quiz: one(quizzes, { fields: [quizAttempts.quizId], references: [quizzes.id] }),
  student: one(users, { fields: [quizAttempts.studentId], references: [users.id] }),
}));

export const termResultsRelations = relations(termResults, ({ one }) => ({
  room: one(rooms, { fields: [termResults.roomId], references: [rooms.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
