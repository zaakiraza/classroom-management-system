/** AUTO-GENERATED from openapi — do not edit. */
import { request, setAuthSession, setAuthToken } from "../http";
import type { AnnouncementsCreateRequest, AnnouncementsCreateResponse, AnnouncementsListResponse, AnnouncementsUpdateRequest, AnnouncementsUpdateResponse, AssignmentsCreateRequest, AssignmentsCreateResponse, AssignmentsListResponse, AttendanceGetQuery, AttendanceGetResponse, AttendanceMeResponse, AttendanceUpsertRequest, AttendanceUpsertResponse, AuthLoginRequest, AuthLoginResponse, AuthSetPasswordRequest, GradebookGetResponse, GradebookMeResponse, NotificationsListQuery, NotificationsListResponse, NotificationsMarkReadRequest, NotificationsMarkReadResponse, QuizzesAttemptGetResponse, QuizzesAttemptSaveRequest, QuizzesAttemptSaveResponse, QuizzesCreateRequest, QuizzesCreateResponse, QuizzesListResponse, QuizzesResultsResponse, QuizzesUpdateRequest, QuizzesUpdateResponse, ResultGetResponse, ResultPublishRequest, ResultPublishResponse, RoomsCreateRequest, RoomsCreateResponse, RoomsListEnrolledResponse, RoomsListMineResponse, RoomsListResponse, RoomsStudentsEnrollRequest, RoomsStudentsEnrollResponse, RoomsStudentsListResponse, RoomsUpdateRequest, RoomsUpdateResponse, SubmissionsGetMineResponse, SubmissionsGradeRequest, SubmissionsGradeResponse, SubmissionsListResponse, SubmissionsUploadResponse, UsersCreateRequest, UsersCreateResponse, UsersListQuery, UsersListResponse, UsersUpdateRequest, UsersUpdateResponse } from "./types";

/** Pick the JWT from a login/register body (OpenAPI field names vary). */
function extractAccessToken(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const body = result as Record<string, unknown>;
  for (const key of ["accessToken", "token", "access_token", "sessionToken", "session_token"] as const) {
    const value = body[key];
    if (typeof value === "string" && value) return value;
  }
  return undefined;
}

function withQuery(path: string, query?: object): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function auth_login(body: AuthLoginRequest): Promise<AuthLoginResponse> {
  const result = await request<AuthLoginResponse>("POST", "/auth/login", body);
  const token = extractAccessToken(result);
  if (token) {
    setAuthToken(token);
    setAuthSession(result);
  }
  return result;
}

export async function auth_set_password(body: AuthSetPasswordRequest): Promise<void> {
  return request<void>("POST", "/auth/set-password", body);
}

export async function users_list(query?: UsersListQuery): Promise<UsersListResponse> {
  return request<UsersListResponse>("GET", withQuery("/users", query));
}

export async function users_create(body: UsersCreateRequest): Promise<UsersCreateResponse> {
  return request<UsersCreateResponse>("POST", "/users", body);
}

export async function users_update(id: string, body: UsersUpdateRequest): Promise<UsersUpdateResponse> {
  return request<UsersUpdateResponse>("PATCH", `/users/${id}`, body);
}

export async function rooms_list(): Promise<RoomsListResponse> {
  return request<RoomsListResponse>("GET", "/rooms");
}

export async function rooms_create(body: RoomsCreateRequest): Promise<RoomsCreateResponse> {
  return request<RoomsCreateResponse>("POST", "/rooms", body);
}

export async function rooms_list_mine(): Promise<RoomsListMineResponse> {
  return request<RoomsListMineResponse>("GET", "/rooms/mine");
}

export async function rooms_list_enrolled(): Promise<RoomsListEnrolledResponse> {
  return request<RoomsListEnrolledResponse>("GET", "/rooms/enrolled");
}

export async function rooms_update(id: string, body: RoomsUpdateRequest): Promise<RoomsUpdateResponse> {
  return request<RoomsUpdateResponse>("PATCH", `/rooms/${id}`, body);
}

export async function rooms_students_list(id: string): Promise<RoomsStudentsListResponse> {
  return request<RoomsStudentsListResponse>("GET", `/rooms/${id}/students`);
}

export async function rooms_students_enroll(id: string, body: RoomsStudentsEnrollRequest): Promise<RoomsStudentsEnrollResponse> {
  return request<RoomsStudentsEnrollResponse>("POST", `/rooms/${id}/students`, body);
}

export async function rooms_students_remove(id: string, studentId: string): Promise<void> {
  return request<void>("DELETE", `/rooms/${id}/students/${studentId}`);
}

export async function attendance_get(id: string, query?: AttendanceGetQuery): Promise<AttendanceGetResponse> {
  return request<AttendanceGetResponse>("GET", withQuery(`/rooms/${id}/attendance`, query));
}

export async function attendance_upsert(id: string, body: AttendanceUpsertRequest): Promise<AttendanceUpsertResponse> {
  return request<AttendanceUpsertResponse>("PUT", `/rooms/${id}/attendance`, body);
}

export async function attendance_me(id: string): Promise<AttendanceMeResponse> {
  return request<AttendanceMeResponse>("GET", `/rooms/${id}/attendance/me`);
}

export async function announcements_list(id: string): Promise<AnnouncementsListResponse> {
  return request<AnnouncementsListResponse>("GET", `/rooms/${id}/announcements`);
}

export async function announcements_create(id: string, body: AnnouncementsCreateRequest): Promise<AnnouncementsCreateResponse> {
  return request<AnnouncementsCreateResponse>("POST", `/rooms/${id}/announcements`, body);
}

export async function announcements_delete(id: string): Promise<void> {
  return request<void>("DELETE", `/announcements/${id}`);
}

export async function announcements_update(id: string, body: AnnouncementsUpdateRequest): Promise<AnnouncementsUpdateResponse> {
  return request<AnnouncementsUpdateResponse>("PATCH", `/announcements/${id}`, body);
}

export async function assignments_list(id: string): Promise<AssignmentsListResponse> {
  return request<AssignmentsListResponse>("GET", `/rooms/${id}/assignments`);
}

export async function assignments_create(id: string, body: AssignmentsCreateRequest): Promise<AssignmentsCreateResponse> {
  return request<AssignmentsCreateResponse>("POST", `/rooms/${id}/assignments`, body);
}

export async function submissions_get_mine(id: string): Promise<SubmissionsGetMineResponse> {
  return request<SubmissionsGetMineResponse>("GET", `/assignments/${id}/submission`);
}

export async function submissions_upload(id: string): Promise<SubmissionsUploadResponse> {
  return request<SubmissionsUploadResponse>("POST", `/assignments/${id}/submission`);
}

export async function submissions_list(id: string): Promise<SubmissionsListResponse> {
  return request<SubmissionsListResponse>("GET", `/assignments/${id}/submissions`);
}

export async function submissions_grade(id: string, body: SubmissionsGradeRequest): Promise<SubmissionsGradeResponse> {
  return request<SubmissionsGradeResponse>("PATCH", `/submissions/${id}/grade`, body);
}

export async function quizzes_list(id: string): Promise<QuizzesListResponse> {
  return request<QuizzesListResponse>("GET", `/rooms/${id}/quizzes`);
}

export async function quizzes_create(id: string, body: QuizzesCreateRequest): Promise<QuizzesCreateResponse> {
  return request<QuizzesCreateResponse>("POST", `/rooms/${id}/quizzes`, body);
}

export async function quizzes_update(id: string, body: QuizzesUpdateRequest): Promise<QuizzesUpdateResponse> {
  return request<QuizzesUpdateResponse>("PATCH", `/quizzes/${id}`, body);
}

export async function quizzes_results(id: string): Promise<QuizzesResultsResponse> {
  return request<QuizzesResultsResponse>("GET", `/quizzes/${id}/results`);
}

export async function quizzes_attempt_get(id: string): Promise<QuizzesAttemptGetResponse> {
  return request<QuizzesAttemptGetResponse>("GET", `/quizzes/${id}/attempt`);
}

export async function quizzes_attempt_save(id: string, body: QuizzesAttemptSaveRequest): Promise<QuizzesAttemptSaveResponse> {
  return request<QuizzesAttemptSaveResponse>("POST", `/quizzes/${id}/attempt`, body);
}

export async function gradebook_get(id: string): Promise<GradebookGetResponse> {
  return request<GradebookGetResponse>("GET", `/rooms/${id}/gradebook`);
}

export async function gradebook_me(id: string): Promise<GradebookMeResponse> {
  return request<GradebookMeResponse>("GET", `/rooms/${id}/gradebook/me`);
}

export async function result_get(id: string): Promise<ResultGetResponse> {
  return request<ResultGetResponse>("GET", `/rooms/${id}/result`);
}

export async function result_publish(id: string, body: ResultPublishRequest): Promise<ResultPublishResponse> {
  return request<ResultPublishResponse>("PUT", `/rooms/${id}/result`, body);
}

export async function notifications_list(query?: NotificationsListQuery): Promise<NotificationsListResponse> {
  return request<NotificationsListResponse>("GET", withQuery("/notifications", query));
}

export async function notifications_mark_read(body: NotificationsMarkReadRequest): Promise<NotificationsMarkReadResponse> {
  return request<NotificationsMarkReadResponse>("POST", "/notifications/read", body);
}

export { setAuthToken };
