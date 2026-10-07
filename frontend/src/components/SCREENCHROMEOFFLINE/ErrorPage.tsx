import type { ReactNode } from "react";
import { Card } from "../../components/Shared";

/** Centered offline card with a disconnected icon, heading and explanation. */
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
          <path d="M12 20h.01" />
          <path d="M8.5 16.4a5 5 0 0 1 7 0" />
          <path d="M5 12.9a10 10 0 0 1 5.3-2.8" />
          <path d="M19 12.9a10 10 0 0 0-2.6-1.7" />
          <path d="M2 8.8a15 15 0 0 1 4.2-2.4" />
          <path d="M22 8.8a15 15 0 0 0-8.5-2.3" />
          <path d="m2 2 20 20" />
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
