import { useLocation, useParams } from "react-router-dom";

/**
 * Id from a ui-spec route such as /rooms/{id}/roster. The router registers the
 * spec's literal `{id}` segment, so prefer a real path param and otherwise read
 * the id straight out of the URL.
 */
export function useRouteId(key = "id"): string {
  const params = useParams();
  const { pathname } = useLocation();
  const direct = params[key];
  if (direct) return direct;
  const marker = `/{${key}}`;
  const at = pathname.indexOf(marker);
  if (at >= 0) {
    const rest = pathname.slice(at + marker.length).replace(/^\//, "");
    return rest ? rest.split("/")[0] : marker.slice(1);
  }
  return key;
}
