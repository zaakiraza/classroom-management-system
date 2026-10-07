import { ErrorPage } from "../components/SCREENCHROME404/ErrorPage";
import { HomeLink } from "../components/SCREENCHROME404/HomeLink";

/** Not Found (/404): route-not-found page with a link home. */
export function SCREENCHROME404() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6">
      <ErrorPage code="404" title="Page Not Found" message="The page you are looking for does not exist.">
        <HomeLink />
      </ErrorPage>
    </main>
  );
}
