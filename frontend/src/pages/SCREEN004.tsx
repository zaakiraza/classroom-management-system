import { useCallback, useEffect, useState, type FormEvent } from "react";
import { rooms_create, rooms_list, rooms_update, users_list } from "../api";
import type { RoomsListResponse, UsersListResponse } from "../generated/types";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

const inputClasses =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";
const labelClasses = "block text-xs font-semibold uppercase tracking-wide text-slate-500";
const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

/** Admin — Rooms Management (/admin/rooms): create rooms, assign owners, manage the term. */
export function SCREEN004() {
  const [rooms, setRooms] = useState<RoomsListResponse>([]);
  const [teachers, setTeachers] = useState<UsersListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [ownerTeacherId, setOwnerTeacherId] = useState("");
  const [termCloseDate, setTermCloseDate] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOwner, setEditOwner] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsResponse, usersResponse] = await Promise.all([rooms_list(), users_list({ role: "teacher" })]);
      setRooms(roomsResponse);
      setTeachers(usersResponse);
      setOwnerTeacherId((current) => current || usersResponse[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unexpected error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setNotice(null);
    if (!name.trim()) {
      setActionError("Room name is required.");
      return;
    }
    if (!ownerTeacherId) {
      setActionError("Create a teacher account first, then assign the room.");
      return;
    }
    setCreating(true);
    try {
      await rooms_create({
        name: name.trim(),
        ownerTeacherId: ownerTeacherId,
        termCloseDate: termCloseDate || undefined,
      });
      setNotice(`Room “${name.trim()}” created.`);
      setName("");
      setTermCloseDate("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to create the room.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(id: string, current: "active" | "deactivated") {
    setActionError(null);
    setNotice(null);
    setBusyId(id);
    try {
      await rooms_update(id, { status: current === "active" ? "deactivated" : "active" });
      setNotice("Room status updated.");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update the room.");
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(id: string, currentName: string, currentOwner: string) {
    setEditId(id);
    setEditName(currentName);
    setEditOwner(currentOwner);
    setActionError(null);
    setNotice(null);
  }

  async function saveEdit(id: string) {
    setActionError(null);
    setNotice(null);
    if (!editName.trim()) {
      setActionError("Room name cannot be empty.");
      return;
    }
    setBusyId(id);
    try {
      await rooms_update(id, { name: editName.trim(), ownerTeacherId: editOwner });
      setNotice("Room saved.");
      setEditId(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to save the room.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Rooms Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create rooms, assign an owning teacher, rename them, and deactivate when the term ends.
        </p>
      </header>

      <Card className="mb-8 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Create room</h2>
        <form onSubmit={handleCreate} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="room-name" className={labelClasses}>
              Room name
            </label>
            <input
              id="room-name"
              className={inputClasses + " mt-1"}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Math 101 — Section A"
            />
          </div>
          <div>
            <label htmlFor="room-owner" className={labelClasses}>
              Owning teacher
            </label>
            <select
              id="room-owner"
              className={inputClasses + " mt-1"}
              value={ownerTeacherId}
              onChange={(event) => setOwnerTeacherId(event.target.value)}
            >
              <option value="">Select a teacher…</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="room-close" className={labelClasses}>
              Term close date
            </label>
            <input
              id="room-close"
              type="date"
              className={inputClasses + " mt-1"}
              value={termCloseDate}
              onChange={(event) => setTermCloseDate(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={creating} className={primaryClasses + " w-full"}>
              {creating ? "Creating…" : "Create room"}
            </button>
          </div>
        </form>
        {actionError ? <ErrorMessage>{actionError}</ErrorMessage> : null}
        {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading rooms…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error.message}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
            Try again
          </button>
        </Card>
      ) : rooms.length === 0 ? (
        <EmptyState>No rooms yet — create the first one above.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {rooms.map((room) => {
            const active = room.status === "active";
            const editing = editId === room.id;
            return (
              <li key={room.id}>
                <Card className="p-4">
                  {editing ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input
                        aria-label="Room name"
                        className={inputClasses}
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                      />
                      <select
                        aria-label="Owning teacher"
                        className={inputClasses}
                        value={editOwner}
                        onChange={(event) => setEditOwner(event.target.value)}
                      >
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button type="button" className={primaryClasses} disabled={busyId === room.id} onClick={() => void saveEdit(room.id)}>
                          Save
                        </button>
                        <button type="button" className={ghostClasses} onClick={() => setEditId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-slate-900">{room.name}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Owner {teachers.find((teacher) => teacher.id === room.ownerTeacherId)?.name ?? room.ownerTeacherId}
                          {room.termCloseDate ? ` · term closes ${room.termCloseDate}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide " +
                            (active
                              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/30"
                              : "bg-slate-100 text-slate-600 ring-1 ring-slate-300")
                          }
                        >
                          {room.status}
                        </span>
                        <button type="button" className={ghostClasses} onClick={() => startEdit(room.id, room.name, room.ownerTeacherId)}>
                          Edit
                        </button>
                        <button type="button" className={ghostClasses} disabled={busyId === room.id} onClick={() => void toggleStatus(room.id, room.status)}>
                          {active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
