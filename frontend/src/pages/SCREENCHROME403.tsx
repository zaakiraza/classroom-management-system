import { ErrorPage } from "../components/SCREENCHROME403/ErrorPage";
import { BackLink } from "../components/SCREENCHROME403/BackLink";

/** Access Denied (/403): permission denial that reveals nothing about the record. */
export function SCREENCHROME403() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6">
      <ErrorPage code="403" title="Access Denied" message="You do not have access to this page.">
        <BackLink />
      </ErrorPage>
    </main>
  );
}
