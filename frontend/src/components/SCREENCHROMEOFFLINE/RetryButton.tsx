import { useState, type ButtonHTMLAttributes } from "react";
import { useNavigate } from "react-router-dom";

/** Re-checks the connection: back home when online, a nudge to retry when not. */
export function RetryButton({
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const navigate = useNavigate();
  const [stillOffline, setStillOffline] = useState(false);

  const retry = () => {
    if (navigator.onLine) {
      navigate("/");
    } else {
      setStillOffline(true);
    }
  };

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={retry}
        className={
          "inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white " +
          "transition-colors hover:bg-[#0c5a46] " +
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
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
        Retry
      </button>
      {stillOffline ? (
        <p className="muted mt-3 text-sm" role="status">
          Still offline. Check your connection and try again.
        </p>
      ) : null}
    </div>
  );
}
