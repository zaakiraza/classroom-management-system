/** Pill showing how many notifications are still unread. */
export function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  const unread = Math.max(0, count);
  return (
    <span
      aria-label={`${unread} unread ${unread === 1 ? "notification" : "notifications"}`}
      className={
        "inline-flex h-7 min-w-[2rem] items-center justify-center gap-1 rounded-full px-2.5 text-sm font-semibold " +
        (unread > 0 ? "bg-[#0f6e56] text-white" : "bg-slate-200 text-slate-600") +
        " " +
        className
      }
    >
      <span className="material-symbols-outlined text-base" aria-hidden="true">
        notifications
      </span>
      {unread}
    </span>
  );
}
