import { ErrorPage } from "../components/SCREENCHROMEOFFLINE/ErrorPage";
import { RetryButton } from "../components/SCREENCHROMEOFFLINE/RetryButton";

/** Offline (/offline): shown when the app cannot reach the server. */
export function SCREENCHROMEOFFLINE() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6">
      <ErrorPage
        code="Offline"
        title="You are offline"
        message="You are offline. Check your connection and retry."
      >
        <RetryButton />
      </ErrorPage>
    </main>
  );
}
