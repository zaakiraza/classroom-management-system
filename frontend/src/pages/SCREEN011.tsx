import { useCallback, useEffect, useState } from "react";
import { submissions_get_mine, submissions_upload } from "../api";
import type { SubmissionsGetMineResponse } from "../generated/types";
import { ApiError } from "../http";
import { useRouteId } from "../route-params";
import { Card, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

/** Assignment Submission (Student) (/assignments/{id}/submit): hand in my work. */
export function SCREEN011() {
  const assignmentId = useRouteId();
  const [submission, setSubmission] = useState<SubmissionsGetMineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      setSubmission(await submissions_get_mine(assignmentId));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setSubmission(null);
      } else {
        setError(err instanceof Error ? err.message : "Unable to load your submission.");
      }
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const uploaded = await submissions_upload(assignmentId);
      setSubmission(uploaded);
      setNotice("Work submitted — your teacher can see it now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit your work.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Submit assignment</h1>
        <p className="mt-1 text-sm text-slate-500">Assignment {assignmentId} — hand in or refresh your submission.</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading your submission…</span>
        </div>
      ) : (
        <>
          <Card className="mb-6 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">My submission</h2>
            {submission ? (
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="muted w-32 shrink-0">File</dt>
                  <dd className="truncate text-slate-900">{submission.fileUrl || "—"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="muted w-32 shrink-0">Submitted</dt>
                  <dd className="text-slate-900">{new Date(submission.submittedAt).toLocaleString()}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="muted w-32 shrink-0">On time</dt>
                  <dd className="text-slate-900">{submission.isLate ? "No — marked late" : "Yes"}</dd>
                </div>
              </dl>
            ) : (
              <p className="muted text-sm">You have not submitted anything for this assignment yet.</p>
            )}
          </Card>

          <Card className="p-5">
            <button type="button" className={primaryClasses} disabled={submitting} onClick={() => void handleSubmit()}>
              {submitting ? "Submitting…" : submission ? "Re-submit work" : "Submit work"}
            </button>
            <p className="muted mt-3 text-xs">
              Submitting uploads your attempt for this assignment; the teacher sees the latest version.
            </p>
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
          </Card>
        </>
      )}
    </main>
  );
}
