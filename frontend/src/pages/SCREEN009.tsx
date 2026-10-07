import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { announcements_create, announcements_delete, announcements_list, announcements_update } from "../api";
import type { AnnouncementsListResponse } from "../generated/types";
import { useRouteId } from "../route-params";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const inputClasses =
  "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";
const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

/** Announcements (Room) (/rooms/{id}/announcements): post, edit, and remove room news. */
export function SCREEN009() {
  const roomId = useRouteId();
  const [items, setItems] = useState<AnnouncementsListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await announcements_list(roomId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load announcements.");
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
    if (!title.trim() || !body.trim()) {
      setActionError("Give the announcement a title and a body.");
      return;
    }
    setPosting(true);
    try {
      await announcements_create(roomId, { title: title.trim(), body: body.trim() });
      setNotice("Announcement posted.");
      setTitle("");
      setBody("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to post the announcement.");
    } finally {
      setPosting(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setActionError(null);
    setNotice(null);
    setBusyId(id);
    try {
      await announcements_update(id, { title: draftTitle.trim(), body: draftBody.trim() });
      setNotice("Announcement updated.");
      setEditingId(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update the announcement.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    setNotice(null);
    setBusyId(id);
    try {
      await announcements_delete(id);
      setNotice("Announcement deleted.");
      if (editingId === id) setEditingId(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to delete the announcement.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Announcements</h1>
        <p className="mt-1 text-sm text-slate-500">Room {roomId} — share news with everyone in the room.</p>
      </header>

      <Card className="mb-8 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">New announcement</h2>
        <form onSubmit={handleCreate} noValidate className="space-y-3">
          <div>
            <label htmlFor="announcement-title" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              id="announcement-title"
              className={inputClasses + " mt-1 w-full"}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Lab session moved to Friday"
            />
          </div>
          <div>
            <label htmlFor="announcement-body" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Message
            </label>
            <textarea
              id="announcement-body"
              rows={3}
              className={inputClasses + " mt-1 w-full"}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write the details students should know…"
            />
          </div>
          <button type="submit" disabled={posting} className={primaryClasses}>
            {posting ? "Posting…" : "Post announcement"}
          </button>
          {actionError ? <ErrorMessage>{actionError}</ErrorMessage> : null}
          {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
        </form>
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading announcements…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
            Try again
          </button>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState>No announcements yet — post the first one above.</EmptyState>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="p-5">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <input
                      aria-label="Edit title"
                      className={inputClasses + " w-full"}
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                    />
                    <textarea
                      aria-label="Edit message"
                      rows={3}
                      className={inputClasses + " w-full"}
                      value={draftBody}
                      onChange={(event) => setDraftBody(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <button type="button" className={primaryClasses} disabled={busyId === item.id} onClick={() => void handleSaveEdit(item.id)}>
                        {busyId === item.id ? "Saving…" : "Save changes"}
                      </button>
                      <button type="button" className={ghostClasses} onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                        <p className="muted text-xs">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={ghostClasses}
                          onClick={() => {
                            setEditingId(item.id);
                            setDraftTitle(item.title);
                            setDraftBody(item.body);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => void handleDelete(item.id)}
                          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-red-600 hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {busyId === item.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{item.body}</p>
                  </>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
