import type { ReactNode } from "react";
import { ErrorMessage } from "../Shared";

/** Banner for API failures; renders nothing when there is no message. */
export function ErrorBanner({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
      <ErrorMessage>{children}</ErrorMessage>
    </div>
  );
}
