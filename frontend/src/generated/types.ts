/** AUTO-GENERATED from openapi — do not edit. */
export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  role: "admin" | "teacher" | "student";
  home: string;
}

export interface AuthSetPasswordRequest {
  token: string;
  password: string;
}

export interface UsersListQuery {
  q?: string;
  role?: "admin" | "teacher" | "student";
}

export type UsersListResponse = { id: string; name: string; email: string; role: "admin" | "teacher" | "student"; status: "active" | "pending" | "deactivated"; enrollmentYear?: number; setPasswordTokenExpiresAt?: string }[];

export interface UsersCreateRequest {
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  enrollmentYear?: number;
}

export interface UsersCreateResponse {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  status: "active" | "pending" | "deactivated";
  enrollmentYear?: number;
  setPasswordTokenExpiresAt?: string;
}

export interface UsersUpdateRequest {
  name?: string;
  email?: string;
  role?: "admin" | "teacher" | "student";
  status?: "active" | "pending" | "deactivated";
  enrollmentYear?: number;
  action?: "resend-set-password";
}

export interface UsersUpdateResponse {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  status: "active" | "pending" | "deactivated";
  enrollmentYear?: number;
  setPasswordTokenExpiresAt?: string;
}

export type RoomsListResponse = { id: string; name: string; status: "active" | "deactivated"; ownerTeacherId: string; termCloseDate?: string }[];

export interface RoomsCreateRequest {
  name: string;
  ownerTeacherId: string;
  termCloseDate?: string;
}

export interface RoomsCreateResponse {
  id: string;
  name: string;
  status: "active" | "deactivated";
  ownerTeacherId: string;
  termCloseDate?: string;
}

export type RoomsListMineResponse = { id: string; name: string; status: "active" | "deactivated"; ownerTeacherId: string; termCloseDate?: string }[];

export type RoomsListEnrolledResponse = { id: string; name: string; status: "active" | "deactivated"; ownerTeacherId: string; termCloseDate?: string }[];

export interface RoomsUpdateRequest {
  name?: string;
  ownerTeacherId?: string;
  status?: "active" | "deactivated";
  termCloseDate?: unknown;
}

export interface RoomsUpdateResponse {
  id: string;
  name: string;
  status: "active" | "deactivated";
  ownerTeacherId: string;
  termCloseDate?: string;
}

export type RoomsStudentsListResponse = { id: string; roomId: string; studentId: string; enrolledAt: string; removedAt?: unknown; student?: { id: string; name: string; email: string; role: "admin" | "teacher" | "student"; status: "active" | "pending" | "deactivated"; enrollmentYear?: number; setPasswordTokenExpiresAt?: string } }[];

export interface RoomsStudentsEnrollRequest {
  studentId: string;
}

export interface RoomsStudentsEnrollResponse {
  id: string;
  roomId: string;
  studentId: string;
  enrolledAt: string;
  removedAt?: unknown;
  student?: { id: string; name: string; email: string; role: "admin" | "teacher" | "student"; status: "active" | "pending" | "deactivated"; enrollmentYear?: number; setPasswordTokenExpiresAt?: string };
}

export interface AttendanceGetQuery {
  date: string;
}

export interface AttendanceGetResponse {
  record?: unknown;
}

export interface AttendanceUpsertRequest {
  date: string;
  entries: { studentId: string; status: "present" | "absent" | "late" }[];
}

export interface AttendanceUpsertResponse {
  id: string;
  roomId: string;
  date: string;
  entries: { id: string; attendanceRecordId?: string; studentId: string; status: "present" | "absent" | "late" }[];
}

export interface AttendanceMeResponse {
  enrollmentActive: boolean;
  entries: { id: string; attendanceRecordId?: string; studentId: string; status: "present" | "absent" | "late" }[];
  counts: { present?: number; absent?: number; late?: number };
}

export type AnnouncementsListResponse = { id: string; roomId: string; authorId: string; title: string; body: string; createdAt: string; updatedAt?: unknown }[];

export interface AnnouncementsCreateRequest {
  title: string;
  body: string;
}

export interface AnnouncementsCreateResponse {
  id: string;
  roomId: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt?: unknown;
}

export interface AnnouncementsUpdateRequest {
  title?: string;
  body?: string;
}

export interface AnnouncementsUpdateResponse {
  id: string;
  roomId: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt?: unknown;
}

export type AssignmentsListResponse = { id: string; roomId: string; title: string; instructions: string; dueAt: string; totalPoints: number }[];

export interface AssignmentsCreateRequest {
  title: string;
  instructions: string;
  dueAt: string;
  totalPoints: number;
}

export interface AssignmentsCreateResponse {
  id: string;
  roomId: string;
  title: string;
  instructions: string;
  dueAt: string;
  totalPoints: number;
}

export interface SubmissionsGetMineResponse {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
  submittedAt: string;
  isLate: boolean;
  gradePoints?: unknown;
  gradeComment?: unknown;
  gradedAt?: unknown;
}

export interface SubmissionsUploadResponse {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
  submittedAt: string;
  isLate: boolean;
  gradePoints?: unknown;
  gradeComment?: unknown;
  gradedAt?: unknown;
}

export type SubmissionsListResponse = { id: string; assignmentId: string; studentId: string; fileUrl: string; submittedAt: string; isLate: boolean; gradePoints?: unknown; gradeComment?: unknown; gradedAt?: unknown }[];

export interface SubmissionsGradeRequest {
  gradePoints: number;
  gradeComment?: string;
}

export interface SubmissionsGradeResponse {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
  submittedAt: string;
  isLate: boolean;
  gradePoints?: unknown;
  gradeComment?: unknown;
  gradedAt?: unknown;
}

export type QuizzesListResponse = { id: string; roomId: string; title: string; opensAt?: unknown; closesAt: string; publishedAt?: unknown; questions?: { id: string; prompt: string; points: number; options: { id: string; text: string }[] }[] }[];

export interface QuizzesCreateRequest {
  title: string;
  opensAt?: string;
  closesAt: string;
  questions: { prompt: string; points: number; options: { text: string; isCorrect: boolean }[] }[];
}

export interface QuizzesCreateResponse {
  id: string;
  roomId: string;
  title: string;
  opensAt?: unknown;
  closesAt: string;
  publishedAt?: unknown;
  questions?: { id: string; prompt: string; points: number; options: { id: string; text: string }[] }[];
}

export interface QuizzesUpdateRequest {
  title?: string;
  opensAt?: unknown;
  closesAt?: string;
  publishedAt?: unknown;
  questions?: { prompt: string; points: number; options: { text: string; isCorrect: boolean }[] }[];
}

export interface QuizzesUpdateResponse {
  id: string;
  roomId: string;
  title: string;
  opensAt?: unknown;
  closesAt: string;
  publishedAt?: unknown;
  questions?: { id: string; prompt: string; points: number; options: { id: string; text: string }[] }[];
}

export interface QuizzesResultsResponse {
  attempts?: { studentId?: string; status?: "in_progress" | "submitted"; score?: number }[];
  distribution?: { questionId?: string; optionId?: string; count?: number }[];
}

export interface QuizzesAttemptGetResponse {
  quiz: { id: string; roomId: string; title: string; opensAt?: unknown; closesAt: string; publishedAt?: unknown; questions?: { id: string; prompt: string; points: number; options: { id: string; text: string }[] }[] };
  attempt?: { status?: "in_progress" | "submitted"; answers?: { questionId?: string; optionId?: string }[]; score?: unknown; submittedAt?: unknown; perQuestion?: { questionId: string; chosenOptionId: unknown; correctOptionId: string; isCorrect: boolean }[] };
}

export interface QuizzesAttemptSaveRequest {
  answers: { questionId: string; optionId: string }[];
  submit?: boolean;
}

export interface QuizzesAttemptSaveResponse {

}

export type GradebookGetResponse = { studentId: string; items: { type: "assignment" | "quiz"; itemId: string; points: number; total: number; comment?: unknown }[]; percentage: number }[];

export interface GradebookMeResponse {
  items: { type: "assignment" | "quiz"; itemId: string; points: number; total: number; comment?: unknown }[];
  percentage: number;
}

export interface ResultGetResponse {
  id: string;
  roomId: string;
  term: string;
  summary: Record<string, unknown>;
  publishedAt?: unknown;
  lockedAt?: unknown;
}

export interface ResultPublishRequest {
  term?: string;
  publish?: boolean;
}

export interface ResultPublishResponse {
  id: string;
  roomId: string;
  term: string;
  summary: Record<string, unknown>;
  publishedAt?: unknown;
  lockedAt?: unknown;
}

export interface NotificationsListQuery {
  unreadOnly?: boolean;
}

export interface NotificationsListResponse {
  notifications: { id: string; type: "assignmentPosted" | "quizPosted" | "announcementPosted" | "resultPublished" | "assignmentGraded" | "quizScored"; message: string; link?: unknown; readAt?: unknown; createdAt: string }[];
  unreadCount: number;
}

export interface NotificationsMarkReadRequest {
  ids?: string[];
}

export interface NotificationsMarkReadResponse {
  unreadCount: number;
}
