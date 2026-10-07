import { Link } from "react-router-dom";

interface NavCardProps {
  to: string;
  title: string;
  description: string;
  meta?: string;
  icon?: string;
  className?: string;
}

/** A whole-card link to a management screen. */
export function NavCard({ to, title, description, meta, icon = "arrow_forward", className = "" }: NavCardProps) {
  return (
    <Link
      to={to}
      className={
        "card group flex items-center justify-between gap-4 transition hover:border-[#0f6e56] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6e56] " +
        className
      }
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        {meta ? <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#0f6e56]">{meta}</p> : null}
      </div>
      <span
        className="material-symbols-outlined shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#0f6e56]"
        aria-hidden="true"
      >
        {icon}
      </span>
    </Link>
  );
}
