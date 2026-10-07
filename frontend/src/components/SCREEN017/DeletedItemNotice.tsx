/** Shown on a notification whose source item (assignment, quiz, room…) no longer exists. */
export function DeletedItemNotice({ className = "" }: { className?: string }) {
  return (
    <p className={"flex items-center gap-1 text-xs italic text-slate-500 " + className}>
      <span className="material-symbols-outlined text-sm" aria-hidden="true">
        delete
      </span>
      This item was removed.
    </p>
  );
}
