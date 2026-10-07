import type { ReactNode } from "react";

/** Small validation message rendered right under the field it describes. */
export function InlineError({ children, id }: { children?: ReactNode; id?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-[color:var(--bad)]">
      {children}
    </p>
  );
}
