import { Link } from "react-router-dom";
import { Card } from "../Shared";

/** One row of RoomsListMineResponse. */
export type RoomSummary = {
  id: string;
  name: string;
  status: "active" | "deactivated";
  ownerTeacherId: string;
  termCloseDate?: string;
};

/** Per-room destinations, exactly the routes the flow wires up. */
function roomLinks(id: string) {
  return [
    { to: `/rooms/${id}/attendance`, label: "Attendance" },
    { to: `/student/rooms/${id}/attendance`, label: "Attendance view" },
    { to: `/rooms/${id}/announcements`, label: "Announcements" },
    { to: `/rooms/${id}/assignments`, label: "Assignments" },
    { to: `/rooms/${id}/quizzes`, label: "Quizzes" },
    { to: `/student/rooms/${id}/quizzes`, label: "Quizzes view" },
    { to: `/rooms/${id}/grades`, label: "Grades" },
    { to: `/rooms/${id}/result`, label: "Term result" },
  ];
}

const linkClasses =
  "inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1";

export function RoomCard({ room }: { room: RoomSummary }) {
  const active = room.status === "active";
  return (
    <Card className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-900">{room.name}</h2>
          {room.termCloseDate ? (
            <p className="muted mt-1 text-sm">
              Term closes{" "}
              {new Date(room.termCloseDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          ) : null}
        </div>
        <span
          className={
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide " +
            (active
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/30"
              : "bg-slate-100 text-slate-600 ring-1 ring-slate-300")
          }
        >
          {room.status}
        </span>
      </header>
      <ul className="flex flex-wrap gap-2">
        {roomLinks(room.id).map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={linkClasses}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
