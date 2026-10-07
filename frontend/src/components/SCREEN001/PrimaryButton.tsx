import type { ButtonHTMLAttributes } from "react";
import { LoadingSpinner } from "../Shared";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
}

/** Solid accent button; shows the shared spinner and disables itself while pending. */
export function PrimaryButton({ children, className = "", pending = false, disabled, type = "submit", ...rest }: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || pending}
      className={
        "inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
    >
      {pending ? <LoadingSpinner /> : null}
      {children}
    </button>
  );
}
