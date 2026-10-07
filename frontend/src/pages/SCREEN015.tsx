import { useCallback, useEffect, useState } from "react";
import { gradebook_get, gradebook_me } from "../api";
import type { GradebookGetResponse, GradebookMeResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner } from "../components/Shared";

const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

function scoreColor(percentage: number): string {
  if (percentage >= 90) return "text-emerald-700";
  if (percentage >= 70) return "text-slate-900";
  return "text-red-700";
}

/** Grades View (Room) (/rooms/{id}/grades): the room gradebook plus my own row. */
export function SCREEN015() {
  const roomId = useRouteId();
  const [rows, setRows] = useState<GradebookGetResponse>([]);
  const [mine, setMine] = useState<GradebookMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [all, me] = await Promise.allSettled([gradebook_get(roomId), gradebook_me(roomId)]);
    if (all.status === "fulfilled") {
      setRows(all.value);
    } else {
      setRows([]);
      const err = all.reason;
      setError(err instanceof Error ? err.message : "Unable to load the gradebook.");
    }
    setMine(me.status === "fulfilled" ? me.value : null);
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Grades</h1>
        <p className="mt-1 text-sm text-slate-500">Room {roomId} — running gradebook across assignments and quizzes.</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading grades…</span>
        </div>
      ) : (
        <>
          {mine ? (
            <Card className="mb-8 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">My grade</h2>
                <p className={"text-3xl font-semibold " + scoreColor(mine.percentage)}>{mine.percentage}%</p>
              </div>
              {mine.items.length === 0 ? (
                <p className="muted mt-2 text-sm">Nothing is graded for you yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {mine.items.map((item, index) => (
                    <li key={item.type + "-" + item.itemId + "-" + index} className="flex items-center justify-between py-2 text-sm">
                      <span className="capitalize text-slate-700">{item.type}</span>
                      <span className="font-medium text-slate-900">
                        {item.points} / {item.total}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ) : null}

          {error ? (
            <Card className="mb-8">
              <ErrorMessage>{error}</ErrorMessage>
              <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
                Try again
              </button>
            </Card>
          ) : null}

          {rows.length === 0 && !error ? (
            <EmptyState>No graded work in this room yet.</EmptyState>
          ) : rows.length > 0 ? (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Graded items</th>
                    <th className="px-4 py-3 text-right font-semibold">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.studentId} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3 text-slate-900">Student {row.studentId}</td>
                      <td className="px-4 py-3 text-slate-700">{row.items.length}</td>
                      <td className={"px-4 py-3 text-right font-semibold " + scoreColor(row.percentage)}>{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : null}
        </>
      )}
    </main>
  );
}
