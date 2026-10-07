import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { rooms_list, users_list } from "../api";
import type { RoomsListResponse, UsersListResponse } from "../generated/types";
import { CountCard } from "../components/SCREEN019/CountCard";
import { NavCard } from "../components/SCREEN019/NavCard";
import { ErrorBanner } from "../components/SCREEN019/ErrorBanner";

/** Admin — Home (/admin): room and people counts with navigation cards. */
export function SCREEN019() {
  const [rooms, setRooms] = useState<RoomsListResponse>([]);
  const [users, setUsers] = useState<UsersListResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsResponse, usersResponse] = await Promise.all([rooms_list(), users_list()]);
      setRooms(roomsResponse);
      setUsers(usersResponse);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unexpected error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeRooms = rooms.filter((room) => room.status === "active").length;
  const teachers = users.filter((user) => user.role === "teacher").length;
  const students = users.filter((user) => user.role === "student").length;
  const pendingUsers = users.filter((user) => user.status === "pending").length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Admin — Home</h1>
        <p className="mt-1 text-sm text-slate-500">
          Room and people counts at a glance, with quick navigation to management screens.
        </p>
      </header>

      {error ? <ErrorBanner message={error.message} onRetry={load} className="mb-6" /> : null}

      <section aria-labelledby="admin-overview-heading" className="mb-10">
        <h2 id="admin-overview-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CountCard
            label="Rooms"
            icon="meeting_room"
            loading={loading}
            value={rooms.length}
            hint={
              loading ? null : rooms.length === 0 ? (
                <Link to="/admin/rooms" className="font-medium text-[#0f6e56] underline hover:text-[#0c5a46]">
                  Create your first room
                </Link>
              ) : (
                `${activeRooms} active`
              )
            }
          />
          <CountCard
            label="People"
            icon="groups"
            loading={loading}
            value={users.length}
            hint={
              loading ? null : users.length === 0 ? (
                <Link to="/admin/people" className="font-medium text-[#0f6e56] underline hover:text-[#0c5a46]">
                  Create your first user
                </Link>
              ) : pendingUsers > 0 ? (
                `${pendingUsers} awaiting set-password`
              ) : (
                "All accounts active"
              )
            }
          />
          <CountCard
            label="Teachers"
            icon="person"
            loading={loading}
            value={teachers}
            hint={loading ? null : teachers === 0 ? "No teachers yet" : "Assigned to rooms"}
          />
          <CountCard
            label="Students"
            icon="school"
            loading={loading}
            value={students}
            hint={loading ? null : students === 0 ? "No students yet" : "Enrolled across rooms"}
          />
        </div>
      </section>

      <section aria-labelledby="admin-manage-heading">
        <h2 id="admin-manage-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Manage
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NavCard
            to="/admin/people"
            title="People Management"
            description="Create, edit, and deactivate teacher, student, and admin accounts."
            meta={`${users.length} ${users.length === 1 ? "account" : "accounts"}`}
            icon="group"
          />
          <NavCard
            to="/admin/rooms"
            title="Rooms Management"
            description="Create rooms, assign owning teachers, and manage the term close date."
            meta={`${rooms.length} ${rooms.length === 1 ? "room" : "rooms"}`}
            icon="meeting_room"
          />
        </div>
      </section>
    </main>
  );
}
