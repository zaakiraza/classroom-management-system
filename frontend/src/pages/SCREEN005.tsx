import { useCallback, useEffect, useState } from "react";
import { rooms_students_enroll, rooms_students_list, rooms_students_remove, users_list } from "../api";
import type { RoomsStudentsListResponse, UsersListResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const inputClasses =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";
const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-red-600 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60";

/** Room Roster (/rooms/{id}/roster): enroll students into the room and remove them. */
export function SCREEN005() {
  const roomId = useRouteId();
  const [roster, setRoster] = useState<RoomsStudentsListResponse>([]);
  const [students, setStudents] = useState<UsersListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rosterResponse, studentsResponse] = await Promise.all([rooms_students_list(roomId), users_list({ role: "student" })]);
      setRoster(rosterResponse);
      setStudents(studentsResponse);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unexpected error"));
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleEnroll(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setNotice(null);
    if (!selectedStudentId) {
      setActionError("Choose a student to enroll.");
      return;
    }
    setEnrolling(true);
    try {
      await rooms_students_enroll(roomId, { studentId: selectedStudentId });
      const enrolled = students.find((student) => student.id === selectedStudentId);
      setNotice(`${enrolled?.name ?? "Student"} enrolled.`);
      setSelectedStudentId("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to enroll the student.");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleRemove(studentId: string) {
    setActionError(null);
    setNotice(null);
    setBusyId(studentId);
    try {
      await rooms_students_remove(roomId, studentId);
      setNotice("Student removed from the roster.");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to remove the student.");
    } finally {
      setBusyId(null);
    }
  }

  const enrolledIds = new Set(roster.map((entry) => entry.studentId));
  const available = students.filter((student) => !enrolledIds.has(student.id));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Roster</h1>
        <p className="mt-1 text-sm text-slate-500">Room {roomId} — enroll students and manage who has access.</p>
      </header>

      <Card className="mb-8 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Enroll a student</h2>
        <form onSubmit={handleEnroll} noValidate className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="enroll-student" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student
            </label>
            <select
              id="enroll-student"
              className={inputClasses + " mt-1 w-full"}
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
            >
              <option value="">Select a student…</option>
              {available.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} — {student.email}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={enrolling} className={primaryClasses}>
            {enrolling ? "Enrolling…" : "Enroll"}
          </button>
        </form>
        {available.length === 0 && !loading ? (
          <p className="muted mt-3 text-sm">Every student account is already enrolled in this room.</p>
        ) : null}
        {actionError ? <ErrorMessage>{actionError}</ErrorMessage> : null}
        {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading roster…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error.message}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3 border-slate-300 text-slate-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"}>
            Try again
          </button>
        </Card>
      ) : roster.length === 0 ? (
        <EmptyState>No students enrolled yet.</EmptyState>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {roster.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{entry.student?.name ?? entry.studentId}</p>
                <p className="truncate text-xs text-slate-500">
                  {entry.student?.email ?? "—"} · enrolled {new Date(entry.enrolledAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                className={ghostClasses}
                disabled={busyId === entry.studentId}
                onClick={() => void handleRemove(entry.studentId)}
              >
                {busyId === entry.studentId ? "Removing…" : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
