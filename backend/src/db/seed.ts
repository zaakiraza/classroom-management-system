/**
 * Demo seed for UAT without an external DB. SQLite file (local or /tmp on Vercel) is the store;
 * this fills empty tables with realistic rows so the SPA is not blank.
 *
 * The data/green Builder fills `seedDemo` after `src/db/schema.ts` exists.
 * Set SEED_DEMO=0 to skip.
 */
import { hashPassword } from "../common/auth";
import {
  announcements,
  assignments,
  attendanceEntries,
  attendanceRecords,
  enrollments,
  notifications,
  quizAttempts,
  quizOptions,
  quizQuestions,
  quizzes,
  rooms,
  submissions,
  termResults,
  users,
} from "./schema";
import type { Db } from "./database";

/** Shared password for every seeded account with a password. */
const DEMO_PASSWORD = "Demo1234!";

export async function seedDemo(db: Db): Promise<void> {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) {
    return;
  }

  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await db.insert(users).values([
    {
      id: "u-admin",
      name: "Priya Sharma",
      email: "priya.sharma@classroom.demo",
      role: "admin",
      status: "active",
      passwordHash,
      createdAt: days(-30),
      updatedAt: days(-30),
    },
    {
      id: "u-teacher-1",
      name: "Daniel Okafor",
      email: "daniel.okafor@classroom.demo",
      role: "teacher",
      status: "active",
      passwordHash,
      createdAt: days(-28),
      updatedAt: days(-28),
    },
    {
      id: "u-teacher-2",
      name: "Mei Lin",
      email: "mei.lin@classroom.demo",
      role: "teacher",
      status: "active",
      passwordHash,
      createdAt: days(-28),
      updatedAt: days(-28),
    },
    {
      id: "u-student-1",
      name: "Aisha Khan",
      email: "aisha.khan@classroom.demo",
      role: "student",
      status: "active",
      passwordHash,
      enrollmentYear: 2026,
      createdAt: days(-21),
      updatedAt: days(-21),
    },
    {
      id: "u-student-2",
      name: "Lucas Alvarez",
      email: "lucas.alvarez@classroom.demo",
      role: "student",
      status: "active",
      passwordHash,
      enrollmentYear: 2026,
      createdAt: days(-21),
      updatedAt: days(-21),
    },
    {
      id: "u-student-3",
      name: "Noah Patel",
      email: "noah.patel@classroom.demo",
      role: "student",
      status: "pending",
      enrollmentYear: 2027,
      createdAt: days(-3),
      updatedAt: days(-3),
    },
    {
      id: "u-student-4",
      name: "Emma Fischer",
      email: "emma.fischer@classroom.demo",
      role: "student",
      status: "active",
      passwordHash,
      enrollmentYear: 2027,
      createdAt: days(-20),
      updatedAt: days(-20),
    },
  ]);

  await db.insert(rooms).values([
    {
      id: "room-bio-101",
      name: "Biology 101",
      status: "active",
      ownerTeacherId: "u-teacher-1",
      termCloseDate: days(42),
      createdAt: days(-27),
      updatedAt: days(-27),
    },
    {
      id: "room-math-201",
      name: "Mathematics 201",
      status: "active",
      ownerTeacherId: "u-teacher-2",
      createdAt: days(-26),
      updatedAt: days(-26),
    },
  ]);

  await db.insert(enrollments).values([
    { id: "enr-bio-1", roomId: "room-bio-101", studentId: "u-student-1", enrolledAt: days(-21), createdAt: days(-21), updatedAt: days(-21) },
    { id: "enr-bio-2", roomId: "room-bio-101", studentId: "u-student-2", enrolledAt: days(-21), createdAt: days(-21), updatedAt: days(-21) },
    { id: "enr-bio-3", roomId: "room-bio-101", studentId: "u-student-3", enrolledAt: days(-2), createdAt: days(-2), updatedAt: days(-2) },
    { id: "enr-math-1", roomId: "room-math-201", studentId: "u-student-1", enrolledAt: days(-20), createdAt: days(-20), updatedAt: days(-20) },
    { id: "enr-math-2", roomId: "room-math-201", studentId: "u-student-4", enrolledAt: days(-20), createdAt: days(-20), updatedAt: days(-20) },
  ]);

  await db.insert(attendanceRecords).values({
    id: "att-bio-day1",
    roomId: "room-bio-101",
    date: days(-1),
    createdAt: days(-1),
    updatedAt: days(-1),
  });
  await db.insert(attendanceEntries).values([
    { id: "atte-1", attendanceRecordId: "att-bio-day1", studentId: "u-student-1", status: "present" },
    { id: "atte-2", attendanceRecordId: "att-bio-day1", studentId: "u-student-2", status: "late" },
    { id: "atte-3", attendanceRecordId: "att-bio-day1", studentId: "u-student-3", status: "absent" },
  ]);

  await db.insert(announcements).values([
    {
      id: "ann-bio-1",
      roomId: "room-bio-101",
      authorId: "u-teacher-1",
      title: "Welcome to Biology 101",
      body: "Our first unit covers cell structure. Bring your lab notebook to every session this week.",
      createdAt: days(-14),
      updatedAt: days(-14),
    },
    {
      id: "ann-math-1",
      roomId: "room-math-201",
      authorId: "u-teacher-2",
      title: "Mid-unit check-in on Friday",
      body: "We will review linear equations before the quiz. Bring questions from homework sets 3 and 4.",
      createdAt: days(-5),
      updatedAt: days(-5),
    },
  ]);

  await db.insert(assignments).values({
    id: "asg-bio-1",
    roomId: "room-bio-101",
    title: "Cell Diagram Lab Report",
    instructions: "Draw and label a eukaryotic cell, then write a 300-word summary of organelle functions.",
    dueAt: days(5),
    totalPoints: 50,
    createdAt: days(-7),
    updatedAt: days(-7),
  });
  await db.insert(submissions).values([
    {
      id: "sub-1",
      assignmentId: "asg-bio-1",
      studentId: "u-student-1",
      fileUrl: "https://files.classroom.demo/sub-1.pdf",
      submittedAt: days(-1),
      isLate: false,
      createdAt: days(-1),
      updatedAt: days(-1),
    },
    {
      id: "sub-2",
      assignmentId: "asg-bio-1",
      studentId: "u-student-2",
      fileUrl: "https://files.classroom.demo/sub-2.pdf",
      submittedAt: days(0),
      isLate: true,
      gradePoints: 44,
      gradeComment: "Strong diagrams; watch the mitochondria labels.",
      gradedAt: days(0),
      createdAt: days(0),
      updatedAt: days(0),
    },
  ]);

  await db.insert(quizzes).values({
    id: "quiz-math-1",
    roomId: "room-math-201",
    title: "Linear Equations Quiz",
    opensAt: days(-1),
    closesAt: days(5),
    publishedAt: days(-1),
    createdAt: days(-6),
    updatedAt: days(-1),
  });
  await db.insert(quizQuestions).values([
    { id: "qq-1", quizId: "quiz-math-1", prompt: "Solve for x: 2x + 6 = 14", points: 5 },
    { id: "qq-2", quizId: "quiz-math-1", prompt: "What is the slope of y = 3x - 2?", points: 5 },
  ]);
  await db.insert(quizOptions).values([
    { id: "qo-1a", questionId: "qq-1", text: "x = 4", isCorrect: true },
    { id: "qo-1b", questionId: "qq-1", text: "x = 6", isCorrect: false },
    { id: "qo-1c", questionId: "qq-1", text: "x = 10", isCorrect: false },
    { id: "qo-2a", questionId: "qq-2", text: "3", isCorrect: true },
    { id: "qo-2b", questionId: "qq-2", text: "-2", isCorrect: false },
    { id: "qo-2c", questionId: "qq-2", text: "1/3", isCorrect: false },
  ]);
  await db.insert(quizAttempts).values([
    {
      id: "qa-1",
      quizId: "quiz-math-1",
      studentId: "u-student-1",
      status: "submitted",
      answers: JSON.stringify([{ questionId: "qq-1", optionId: "qo-1a" }, { questionId: "qq-2", optionId: "qo-2a" }]),
      score: 10,
      submittedAt: days(0),
      createdAt: days(-1),
      updatedAt: days(0),
    },
    {
      id: "qa-2",
      quizId: "quiz-math-1",
      studentId: "u-student-4",
      status: "in_progress",
      answers: JSON.stringify([]),
      createdAt: days(0),
      updatedAt: days(0),
    },
  ]);

  await db.insert(termResults).values([
    {
      id: "tr-bio-1",
      roomId: "room-bio-101",
      term: "Fall 2026",
      summary: "Draft: cell biology unit results pending final lab reports.",
      createdAt: days(-4),
      updatedAt: days(-4),
    },
    {
      id: "tr-math-1",
      roomId: "room-math-201",
      term: "Fall 2026",
      summary: "Algebra fundamentals: class average 82%, best unit so far this year.",
      publishedAt: days(-2),
      createdAt: days(-3),
      updatedAt: days(-2),
    },
  ]);

  await db.insert(notifications).values([
    {
      id: "ntf-1",
      userId: "u-student-1",
      type: "assignmentPosted",
      message: 'New assignment in Biology 101: "Cell Diagram Lab Report"',
      link: "/rooms/room-bio-101/assignments/asg-bio-1",
      createdAt: days(-7),
    },
    {
      id: "ntf-2",
      userId: "u-student-1",
      type: "quizScored",
      message: 'Your score for "Linear Equations Quiz" is ready: 10/10',
      link: "/rooms/room-math-201/quizzes/quiz-math-1",
      readAt: days(0),
      createdAt: days(0),
    },
    {
      id: "ntf-3",
      userId: "u-student-2",
      type: "assignmentGraded",
      message: 'Your submission for "Cell Diagram Lab Report" was graded: 44/50',
      link: "/rooms/room-bio-101/assignments/asg-bio-1",
      createdAt: days(0),
    },
  ]);
}
