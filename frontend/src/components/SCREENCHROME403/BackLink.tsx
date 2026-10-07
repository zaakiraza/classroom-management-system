import type { ButtonHTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";

/** Returns the user to where they came from, or to the home screen. */
export function BackLink({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };
  return (
    <button
      type="button"
      onClick={goBack}
      className={
        "inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] " +
        "transition-colors hover:bg-[var(--bg)] hover:text-[var(--accent)] " +
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
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      {children ?? "Go back"}
    </button>
  );
}
