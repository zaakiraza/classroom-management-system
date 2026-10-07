import { ErrorMessage } from "../Shared";

/** Load error with a retry action. */
export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <ErrorMessage>{message}</ErrorMessage>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center rounded-md border border-red-300 bg-white px-3 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1"
      >
        Retry
      </button>
    </div>
  );
}
