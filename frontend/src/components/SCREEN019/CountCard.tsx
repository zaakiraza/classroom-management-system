import type { ReactNode } from "react";

interface CountCardProps {
  label: string;
  value?: number;
  loading?: boolean;
  icon?: string;
  hint?: ReactNode;
  className?: string;
}

/** A single overview metric; shows a skeleton block while its count is pending. */
export function CountCard({ label, value, loading = false, icon = "bar_chart", hint, className = "" }: CountCardProps) {
  return (
    <div className={"card flex flex-col gap-2 " + className}>
      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-500">
        <span className="material-symbols-outlined text-xl" aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {loading ? (
        <div className="h-9 w-16 animate-pulse rounded bg-slate-200" aria-hidden="true" />
      ) : (
        <p className="text-3xl font-semibold text-slate-900">{value ?? 0}</p>
      )}
      {hint ? <div className="text-sm text-slate-500">{hint}</div> : null}
    </div>
  );
}
