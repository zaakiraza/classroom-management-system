import { useCallback, useEffect, useState, type FormEvent } from "react";
import { users_create, users_list, users_update } from "../api";
import type { UsersListResponse } from "../generated/types";
import { Card, EmptyState, ErrorMessage, LoadingSpinner, SuccessMessage } from "../components/Shared";

type Role = "admin" | "teacher" | "student";
type UserStatus = "active" | "pending" | "deactivated";

const ROLES: Role[] = ["admin", "teacher", "student"];

const inputClasses =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30";
const labelClasses = "block text-xs font-semibold uppercase tracking-wide text-slate-500";
const primaryClasses =
  "inline-flex items-center justify-center rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";
const ghostClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60";

const statusChip: Record<UserStatus, string> = {
  active: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/30",
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-600/30",
  deactivated: "bg-slate-100 text-slate-600 ring-1 ring-slate-300",
};

/** Admin — People Management (/admin/people): list, create, and manage accounts. */
export function SCREEN003() {
  const [users, setUsers] = useState<UsersListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | Role>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [year, setYear] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await users_list({ q: search.trim() || undefined, role: roleFilter || undefined }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unexpected error"));
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setNotice(null);
    if (!name.trim() || !email.trim()) {
      setActionError("Name and email are required.");
      return;
    }
    const parsedYear = Number(year);
    setCreating(true);
    try {
      await users_create({
        name: name.trim(),
        email: email.trim(),
        role: role,
        enrollmentYear: year.trim() !== "" && Number.isFinite(parsedYear) ? parsedYear : undefined,
      });
      setNotice(`Account created for ${email.trim()}. They will receive a set-password link.`);
      setName("");
      setEmail("");
      setYear("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to create the account.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(id: string, current: UserStatus) {
    setActionError(null);
    setNotice(null);
    setBusyId(id);
    try {
      await users_update(id, { status: current === "active" ? "deactivated" : "active" });
      setNotice("Account status updated.");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update the account.");
    } finally {
      setBusyId(null);
    }
  }

  async function resendInvite(id: string) {
    setActionError(null);
    setNotice(null);
    setBusyId(id);
    try {
      await users_update(id, { action: "resend-set-password" });
      setNotice("Set-password link resent.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to resend the link.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">People Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create admin, teacher, and student accounts, resend set-password links, and deactivate access.
        </p>
      </header>

      <Card className="mb-8 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Create account</h2>
        <form onSubmit={handleCreate} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-1">
            <label htmlFor="person-name" className={labelClasses}>
              Name
            </label>
            <input
              id="person-name"
              className={inputClasses + " mt-1"}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jordan Lee"
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="person-email" className={labelClasses}>
              Email
            </label>
            <input
              id="person-email"
              type="email"
              className={inputClasses + " mt-1"}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jordan@school.edu"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="person-role" className={labelClasses}>
              Role
            </label>
            <select
              id="person-role"
              className={inputClasses + " mt-1"}
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              {ROLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="person-year" className={labelClasses}>
              Enrollment year
            </label>
            <input
              id="person-year"
              inputMode="numeric"
              className={inputClasses + " mt-1"}
              value={year}
              onChange={(event) => setYear(event.target.value)}
              placeholder="2026"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={creating} className={primaryClasses + " w-full"}>
              {creating ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
        {actionError ? <ErrorMessage>{actionError}</ErrorMessage> : null}
        {notice ? <SuccessMessage>{notice}</SuccessMessage> : null}
      </Card>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          aria-label="Search people"
          className={inputClasses + " max-w-xs"}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email…"
        />
        <select
          aria-label="Filter by role"
          className={inputClasses + " max-w-[10rem]"}
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as "" | Role)}
        >
          <option value="">All roles</option>
          {ROLES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-slate-500">Loading people…</span>
        </div>
      ) : error ? (
        <Card>
          <ErrorMessage>{error.message}</ErrorMessage>
          <button type="button" onClick={() => void load()} className={ghostClasses + " mt-3"}>
            Try again
          </button>
        </Card>
      ) : users.length === 0 ? (
        <EmptyState>No accounts match this filter yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="align-middle">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{user.role}</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize " + statusChip[user.status]}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={ghostClasses} disabled={busyId === user.id} onClick={() => void resendInvite(user.id)}>
                        Resend invite
                      </button>
                      <button
                        type="button"
                        className={ghostClasses}
                        disabled={busyId === user.id}
                        onClick={() => void toggleStatus(user.id, user.status)}
                      >
                        {user.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
