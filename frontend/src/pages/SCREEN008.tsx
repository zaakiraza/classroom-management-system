import { useCallback, useEffect, useState } from "react";
import { attendance_me } from "../api";
import type { AttendanceMeResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, ErrorMessage, LoadingSpinner } from "../components/Shared";

/** Student — Attendance View (/student/rooms/{id}/attendance): my attendance summary. */
export function SCREEN008() {
  const roomId = useRouteId();
  const [data, setData] = useState<AttendanceMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await attendance_me(roomId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your attendance.");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = data?.counts ?? {};

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">My attendance</h1>
        <p className="mt-1 text-sm text-slate-500">Room {roomId} — how often you made it to class.</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading attendance…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800"
          >
            Try again
          </button>
        </Card>
      ) : data ? (
        <>
          {data.enrollmentActive ? null : (
            <Card className="mb-6">
              <ErrorMessage>You are not actively enrolled in this room right now.</ErrorMessage>
            </Card>
          )}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="text-center">
              <p className="text-3xl font-semibold text-emerald-700">{counts.present ?? 0}</p>
              <p className="muted mt-1 text-xs font-semibold uppercase tracking-wide">Present</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-semibold text-slate-900">{counts.late ?? 0}</p>
              <p className="muted mt-1 text-xs font-semibold uppercase tracking-wide">Late</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-semibold text-red-700">{counts.absent ?? 0}</p>
              <p className="muted mt-1 text-xs font-semibold uppercase tracking-wide">Absent</p>
            </Card>
          </div>
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Recorded entries</h2>
            {data.entries.length === 0 ? (
              <p className="muted text-sm">No attendance has been recorded for you yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.entries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700">Session {entry.attendanceRecordId ?? entry.id}</span>
                    <span className="font-medium capitalize text-slate-900">{entry.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </main>
  );
}
