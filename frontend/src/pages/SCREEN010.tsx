import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { assignments_create, assignments_list } from "../api";
import type { AssignmentsListResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const inputClasses =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";
const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

function defaultDue(): string {
  const due = new Date();
  due.setDate(due.getDate() + 7);
  return due.toISOString().slice(0, 16);
}

/** Assignments (Room) (/rooms/{id}/assignments): list coursework and post new assignments. */
export function SCREEN010() {
  const roomId = useRouteId();
  const [items, setItems] = useState<AssignmentsListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState(defaultDue);
  const [totalPoints, setTotalPoints] = useState("100");
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await assignments_list(roomId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setNotice(null);
    const points = Number(totalPoints);
    if (!title.trim() || !instructions.trim()) {
      setActionError("Give the assignment a title and instructions.");
      return;
    }
    if (!Number.isFinite(points) || points <= 0) {
      setActionError("Total points must be a positive number.");
      return;
    }
    setCreating(true);
    try {
      await assignments_create(roomId, {
        title: title.trim(),
        instructions: instructions.trim(),
        dueAt: new Date(dueAt).toISOString(),
        totalPoints: points,
      });
      setNotice("Assignment posted.");
      setTitle("");
      setInstructions("");
      setDueAt(defaultDue());
      setTotalPoints("100");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to create the assignment.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Assignments</h1>
        <p className="mt-1 text-sm text-slate-500">Room {roomId} — coursework, due dates, and points.</p>
      </header>

      <Card className="mb-8 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">New assignment</h2>
        <form onSubmit={handleCreate} noValidate className="space-y-3">
          <div>
            <label htmlFor="assignment-title" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              id="assignment-title"
              className={inputClasses + " mt-1 w-full"}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Week 3 problem set"
            />
          </div>
          <div>
            <label htmlFor="assignment-instructions" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Instructions
            </label>
            <textarea
              id="assignment-instructions"
              rows={3}
              className={inputClasses + " mt-1 w-full"}
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="What should students do, and how will it be graded?"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <label htmlFor="assignment-due" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Due
              </label>
              <input
                id="assignment-due"
                type="datetime-local"
                className={inputClasses + " mt-1"}
                value={dueAt}
                onChange={(event) => setDueAt(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="assignment-points" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total points
              </label>
              <input
                id="assignment-points"
                type="number"
                min={1}
                className={inputClasses + " mt-1 w-32"}
                value={totalPoints}
                onChange={(event) => setTotalPoints(event.target.value)}
              />
            </div>
          </div>
          <button type="submit" disabled={creating} className={primaryClasses}>
            {creating ? "Posting…" : "Post assignment"}
          </button>
          {actionError ? <ErrorMessage>{actionError}</ErrorMessage> : null}
          {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
        </form>
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading assignments…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
            Try again
          </button>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState>No assignments yet — post the first one above.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    {item.totalPoints} points
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{item.instructions}</p>
                <p className="muted mt-3 text-xs">Due {new Date(item.dueAt).toLocaleString()}</p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
