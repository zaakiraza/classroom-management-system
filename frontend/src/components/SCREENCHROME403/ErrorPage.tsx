import type { ReactNode } from "react";
import { Card } from "../../components/Shared";

/** Centered error card with a status code, heading and explanation. */
export function ErrorPage({
  code,
  title,
  message,
  children,
}: {
  code: string;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <Card className="w-full max-w-lg mx-auto p-6 sm:p-10 text-center shadow-sm">
      <div
        aria-hidden="true"
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#b42318]/10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-[var(--bad)]"
        >
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15" r="1.4" />
        </svg>
      </div>
      <p className="muted text-sm font-semibold tracking-widest uppercase">{code}</p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{title}</h1>
      <p className="mt-3 text-[var(--muted)]" role="alert">
        {message}
      </p>
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </Card>
  );
}
