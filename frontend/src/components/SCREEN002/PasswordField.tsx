import { useState, type InputHTMLAttributes } from "react";

/** Text/password input with a show-or-hide toggle (toggle label never says "password"). */
export function PasswordField({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <input
        {...rest}
        type={visible ? "text" : "password"}
        className={
          "w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 pr-16 text-sm text-[color:var(--ink)] shadow-sm placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] " +
          className
        }
      />
      <button
        type="button"
        aria-label={visible ? "Hide" : "Show"}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)] hover:text-[color:var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </span>
  );
}
