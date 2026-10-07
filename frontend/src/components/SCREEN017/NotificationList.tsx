import { Link } from "react-router-dom";
import type { NotificationsListResponse } from "../../generated/types";
import { LoadingSpinner } from "../../components/Shared";
import { DeletedItemNotice } from "./DeletedItemNotice";

export type NotificationRow = NotificationsListResponse["notifications"][number];
export type NotificationType = NotificationRow["type"];

const TYPE_META: Record<NotificationType, { icon: string; label: string }> = {
  assignmentPosted: { icon: "assignment", label: "Assignment posted" },
  quizPosted: { icon: "quiz", label: "Quiz posted" },
  announcementPosted: { icon: "campaign", label: "Announcement" },
  resultPublished: { icon: "emoji_events", label: "Result published" },
  assignmentGraded: { icon: "task_alt", label: "Assignment graded" },
  quizScored: { icon: "score", label: "Quiz scored" },
};

function formatWhen(iso: string): string {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return iso;
  return when.toLocaleString();
}

/** A link survives only while the source item exists; a missing link means it was removed. */
function linkPath(link: unknown): string | undefined {
  return typeof link === "string" && link.startsWith("/") ? link : undefined;
}

function SkeletonList() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {[0, 1, 2, 3].map((row) => (
        <li key={row} className="card flex animate-pulse items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}

interface NotificationListProps {
  items: NotificationRow[];
  loading?: boolean;
  busyId?: string | null;
  onMarkRead?: (id: string) => void;
  className?: string;
}

export function NotificationList({ items, loading = false, busyId = null, onMarkRead, className = "" }: NotificationListProps) {
  if (loading) {
    return (
      <div className={className}>
        <SkeletonList />
      </div>
    );
  }
  return (
    <ul className={"space-y-3 " + className}>
      {items.map((item) => {
        const unread = item.readAt == null;
        const removed = item.link == null;
        const path = linkPath(item.link);
        const meta = TYPE_META[item.type] ?? { icon: "notifications", label: "Notification" };
        const busy = busyId === item.id;
        return (
          <li key={item.id} className={"card flex items-start gap-3 " + (unread ? "border-l-4 border-l-[#0f6e56]" : "bg-slate-50")}>
            <span
              className={
                "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
                (unread ? "bg-[#0f6e56]/10 text-[#0f6e56]" : "bg-slate-200 text-slate-500")
              }
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-xl">{meta.icon}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className={"text-xs font-semibold uppercase tracking-wide " + (unread ? "text-[#0f6e56]" : "text-slate-400")}>
                {meta.label}
              </p>
              <p className={"mt-0.5 break-words " + (unread ? "font-medium text-slate-900" : "text-slate-600")}>
                {path ? (
                  <Link to={path} className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6e56]">
                    {item.message}
                  </Link>
                ) : (
                  item.message
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">{formatWhen(item.createdAt)}</p>
              {removed ? <DeletedItemNotice className="mt-2" /> : null}
            </div>
            {unread && onMarkRead ? (
              <button
                type="button"
                onClick={() => onMarkRead(item.id)}
                disabled={busy}
                className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border border-[#0f6e56] px-2.5 text-xs font-medium text-[#0f6e56] transition hover:bg-[#0f6e56]/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6e56]"
              >
                {busy ? <LoadingSpinner /> : null}
                Mark as read
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
