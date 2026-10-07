import type { ReactNode } from "react";
import { Card } from "../../components/Shared";

/** Centered not-found card with a status code, heading and explanation. */
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
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#5b6b7c]/10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-[var(--muted)]"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8.5 11h5" />
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
