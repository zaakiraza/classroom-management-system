import { LoadingSpinner } from "../../components/Shared";

interface MarkAllButtonProps {
  unreadCount: number;
  busy?: boolean;
  onMarkAll: () => void;
  className?: string;
}

/** Marks every notification read in one call; disabled while nothing is unread. */
export function MarkAllButton({ unreadCount, busy = false, onMarkAll, className = "" }: MarkAllButtonProps) {
  const disabled = busy || unreadCount === 0;
  return (
    <button
      type="button"
      onClick={onMarkAll}
      disabled={disabled}
      className={
        "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6e56] " +
        (disabled
          ? "cursor-not-allowed bg-slate-100 text-slate-400"
          : "bg-[#0f6e56] text-white hover:bg-[#0c5a46]") +
        " " +
        className
      }
    >
      {busy ? <LoadingSpinner /> : null}
      Mark all as read
    </button>
  );
}
