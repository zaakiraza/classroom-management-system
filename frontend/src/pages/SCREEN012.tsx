import { useCallback, useEffect, useState } from "react";
import { submissions_grade, submissions_list } from "../api";
import type { SubmissionsListResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const inputClasses =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";
const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

interface Draft {
  gradePoints: string;
  gradeComment: string;
}

/** Assignment Grading (Teacher) (/assignments/{id}/submissions): grade each hand-in. */
export function SCREEN012() {
  const assignmentId = useRouteId();
  const [items, setItems] = useState<SubmissionsListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await submissions_list(assignmentId);
      setItems(rows);
      setDrafts(
        Object.fromEntries(
          rows.map((row) => [
            row.id,
            {
              gradePoints: typeof row.gradePoints === "number" ? String(row.gradePoints) : "",
              gradeComment: typeof row.gradeComment === "string" ? row.gradeComment : "",
            },
          ]),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGrade(submissionId: string) {
    setActionError(null);
    setNotice(null);
    const draft = drafts[submissionId];
    const points = Number(draft?.gradePoints);
    if (!draft || draft.gradePoints.trim() === "" || !Number.isFinite(points)) {
      setActionError("Enter the points awarded before saving.");
      return;
    }
    setBusyId(submissionId);
    try {
      await submissions_grade(submissionId, {
        gradePoints: points,
        ...(draft.gradeComment.trim() ? { gradeComment: draft.gradeComment.trim() } : {}),
      });
      setNotice("Grade saved.");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to save the grade.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Submissions</h1>
        <p className="mt-1 text-sm text-slate-500">Assignment {assignmentId} — review and grade student work.</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading submissions…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
            Try again
          </button>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState>No submissions yet.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const draft = drafts[item.id] ?? { gradePoints: "", gradeComment: "" };
            return (
              <li key={item.id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">Student {item.studentId}</p>
                      <p className="muted text-xs">
                        Submitted {new Date(item.submittedAt).toLocaleString()} · {item.isLate ? "late" : "on time"}
                      </p>
                    </div>
                    <a href={item.fileUrl} className={ghostClasses} target="_blank" rel="noreferrer">
                      Open file
                    </a>
                  </div>
                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <div>
                      <label htmlFor={"points-" + item.id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Points
                      </label>
                      <input
                        id={"points-" + item.id}
                        type="number"
                        className={inputClasses + " mt-1 w-28"}
                        value={draft.gradePoints}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [item.id]: { ...draft, gradePoints: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="min-w-[12rem] flex-1">
                      <label htmlFor={"comment-" + item.id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Feedback
                      </label>
                      <input
                        id={"comment-" + item.id}
                        className={inputClasses + " mt-1 w-full"}
                        value={draft.gradeComment}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [item.id]: { ...draft, gradeComment: event.target.value },
                          }))
                        }
                        placeholder="Nice work on question 2…"
                      />
                    </div>
                    <button type="button" className={primaryClasses} disabled={busyId === item.id} onClick={() => void handleGrade(item.id)}>
                      {busyId === item.id ? "Saving…" : "Save grade"}
                    </button>
                  </div>
                  {typeof item.gradePoints === "number" ? (
                    <p className="ok mt-2 text-xs">
                      Graded: {item.gradePoints} points
                      {typeof item.gradeComment === "string" && item.gradeComment ? ` — “${item.gradeComment}”` : ""}
                    </p>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      {actionError ? <ErrorMessage>{actionError}</ErrorMessage> : null}
      {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
    </main>
  );
}
