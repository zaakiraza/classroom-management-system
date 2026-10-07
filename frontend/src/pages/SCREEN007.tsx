import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { attendance_get, attendance_upsert, rooms_students_list } from "../api";
import type { RoomsStudentsListResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

type AttendanceStatus = "present" | "absent" | "late";

const STATUSES: AttendanceStatus[] = ["present", "absent", "late"];

const inputClasses =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";
const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The stored record shape is open; read the entries we know about. */
function readMarks(record: unknown): Record<string, AttendanceStatus> {
  const entries = (record as { entries?: { studentId?: string; status?: AttendanceStatus }[] } | undefined)?.entries;
  if (!Array.isArray(entries)) return {};
  const marks: Record<string, AttendanceStatus> = {};
  for (const entry of entries) {
    if (entry?.studentId && entry.status && STATUSES.includes(entry.status)) {
      marks[entry.studentId] = entry.status;
    }
  }
  return marks;
}

/** Attendance Taking (/rooms/{id}/attendance): mark every enrolled student per day and save. */
export function SCREEN007() {
  const roomId = useRouteId();
  const [date, setDate] = useState(today);
  const [roster, setRoster] = useState<RoomsStudentsListResponse>([]);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    const rosterResult = await Promise.allSettled([rooms_students_list(roomId), attendance_get(roomId, { date })]);
    if (rosterResult[0].status === "rejected") {
      const err = rosterResult[0].reason;
      setError(err instanceof Error ? err.message : "Unable to load the roster.");
      setRoster([]);
      setMarks({});
    } else {
      setRoster(rosterResult[0].value);
      setMarks(rosterResult[1].status === "fulfilled" ? readMarks(rosterResult[1].value.record) : {});
    }
    setLoading(false);
  }, [roomId, date]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await attendance_upsert(roomId, {
        date,
        entries: roster.map((entry) => ({
          studentId: entry.studentId,
          status: marks[entry.studentId] ?? "present",
        })),
      });
      setNotice(`Attendance saved for ${date}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">Room {roomId} — take attendance for a class day.</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading attendance…</span>
        </div>
      ) : (
        <>
          <Card className="mb-6 p-5">
            <form onSubmit={handleSave} noValidate>
              <div className="mb-4 max-w-xs">
                <label htmlFor="attendance-date" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </label>
                <input
                  id="attendance-date"
                  type="date"
                  className={inputClasses + " mt-1 w-full"}
                  value={date}
                  onChange={(event) => setDate(event.target.value || today())}
                />
              </div>

              {roster.length === 0 ? (
                <EmptyState>No students enrolled yet — enroll them on the roster page first.</EmptyState>
              ) : (
                <ul className="overflow-hidden rounded-lg border border-slate-200">
                  {roster.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{entry.student?.name ?? entry.studentId}</p>
                        <p className="truncate text-xs text-slate-500">{entry.student?.email ?? "—"}</p>
                      </div>
                      <select
                        aria-label={`Attendance for ${entry.student?.name ?? entry.studentId}`}
                        className={inputClasses}
                        value={marks[entry.studentId] ?? "present"}
                        onChange={(event) =>
                          setMarks((prev) => ({ ...prev, [entry.studentId]: event.target.value as AttendanceStatus }))
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              )}

              {roster.length > 0 ? (
                <button type="submit" disabled={saving} className={primaryClasses + " mt-4"}>
                  {saving ? "Saving…" : "Save attendance"}
                </button>
              ) : null}
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
            </form>
          </Card>
        </>
      )}
    </main>
  );
}
