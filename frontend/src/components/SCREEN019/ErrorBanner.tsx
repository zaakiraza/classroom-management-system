interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Overview failed to load: explains the failure and offers a retry. */
export function ErrorBanner({ message, onRetry, className = "" }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={
        "card flex flex-wrap items-center justify-between gap-3 border-red-200 bg-red-50 " + className
      }
    >
      <div className="min-w-0">
        <p className="font-semibold text-red-800">Could not load overview</p>
        {message ? <p className="mt-1 text-sm text-red-700">{message}</p> : null}
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-9 items-center rounded-md bg-red-700 px-3 text-sm font-medium text-white transition hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
