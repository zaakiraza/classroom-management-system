import { useCallback, useEffect, useState } from "react";
import { result_get, result_publish } from "../api";
import type { ResultGetResponse } from "../generated/types";
import { ApiError } from "../http";
import { useRouteId } from "../route-params";
import { Card, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

/** Term Result (/rooms/{id}/result): inspect and publish the room's term result. */
export function SCREEN016() {
  const roomId = useRouteId();
  const [result, setResult] = useState<ResultGetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      setResult(await result_get(roomId));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setResult(null);
      } else {
        setError(err instanceof Error ? err.message : "Unable to load the term result.");
      }
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handlePublish(publish: boolean) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const saved = await result_publish(roomId, { publish });
      setResult(saved);
      setNotice(publish ? "Result published — students can see it now." : "Result unpublished.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update the result.");
    } finally {
      setBusy(false);
    }
  }

  const summaryEntries = Object.entries(result?.summary ?? {});
  const published = Boolean(result?.publishedAt);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Term result</h1>
        <p className="mt-1 text-sm text-slate-500">Room {roomId} — the end-of-term summary for this room.</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading result…</span>
        </div>
      ) : (
        <>
          <Card className="mb-6 p-5">
            {result ? (
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="muted w-32 shrink-0">Term</dt>
                  <dd className="text-slate-900">{result.term}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="muted w-32 shrink-0">Status</dt>
                  <dd className={published ? "ok" : "muted"}>{published ? "Published" : "Draft — not visible to students"}</dd>
                </div>
                {published && typeof result.publishedAt === "string" ? (
                  <div className="flex gap-2">
                    <dt className="muted w-32 shrink-0">Published at</dt>
                    <dd className="text-slate-900">{new Date(result.publishedAt).toLocaleString()}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="muted text-sm">No term result exists yet for this room.</p>
            )}
          </Card>

          {summaryEntries.length > 0 ? (
            <Card className="mb-6 p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h2>
              <ul className="divide-y divide-slate-100">
                {summaryEntries.map(([key, value]) => (
                  <li key={key} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="capitalize text-slate-700">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-medium text-slate-900">{String(value)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card className="p-5">
            <div className="flex flex-wrap gap-3">
              <button type="button" className={primaryClasses} disabled={busy || published} onClick={() => void handlePublish(true)}>
                {busy ? "Working…" : published ? "Published" : "Publish result"}
              </button>
              {published ? (
                <button type="button" className={ghostClasses} disabled={busy} onClick={() => void handlePublish(false)}>
                  Unpublish
                </button>
              ) : null}
            </div>
            <p className="muted mt-3 text-xs">Publishing makes the term summary visible to every student in the room.</p>
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
          </Card>
        </>
      )}
    </main>
  );
}
