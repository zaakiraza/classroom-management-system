import type { ComponentProps } from "react";
import { Link } from "react-router-dom";

/** Returns the user to the home screen. */
export function HomeLink({
  to = "/",
  children,
  className = "",
  ...rest
}: Omit<ComponentProps<typeof Link>, "to"> & { to?: string }) {
  return (
    <Link
      to={to}
      className={
        "inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white " +
        "transition-colors hover:opacity-90 " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 " +
        className
      }
      {...rest}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
      {children ?? "Back to home"}
    </Link>
  );
}
