import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthSetPasswordRequest } from "../../generated/types";
import { ErrorMessage, LoadingSpinner } from "../../components/Shared";
import { InlineError } from "./InlineError";
import { PasswordField } from "./PasswordField";
import { PrimaryButton } from "./PrimaryButton";

const MIN_LENGTH = 8;
const EXPIRED_COPY = "This link has expired. Ask your administrator to resend it.";
const USED_COPY = "This link has already been used.";
const LOGIN_NOTICE = "Your password has been set. Sign in with your new password.";

/** Prefer the spec's friendly copy when the backend describes an expired or already-used link. */
function linkError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/expir/i.test(message)) return EXPIRED_COPY;
  if (/already been used|\bused\b/i.test(message)) return USED_COPY;
  return message;
}

/** FORM-SET-PASSWORD: hidden token (from the emailed link) + new password, min 8 characters. */
export function SetPasswordForm({
  token,
  submit,
}: {
  token: string;
  submit: (body: AuthSetPasswordRequest) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < MIN_LENGTH) {
      setFieldError(`New password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    setFieldError(undefined);
    setError(undefined);
    setPending(true);
    try {
      await submit({ token, password });
      navigate("/login", { state: { notice: LOGIN_NOTICE } });
    } catch (err) {
      setError(linkError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="token" value={token} />

      <label htmlFor="set-password-new" className="block text-sm font-semibold text-[color:var(--ink)]">
        New password (min 8 characters)
      </label>
      <PasswordField
        id="set-password-new"
        name="password"
        value={password}
        autoComplete="new-password"
        required
        aria-invalid={fieldError ? true : undefined}
        aria-describedby={fieldError ? "set-password-field-error" : undefined}
        onChange={(event) => setPassword(event.target.value)}
        className={fieldError ? "border-[color:var(--bad)]" : ""}
      />
      <InlineError id="set-password-field-error">{fieldError}</InlineError>

      <div className="mt-6 flex items-center gap-3">
        <PrimaryButton type="submit" disabled={pending}>
          Set password
        </PrimaryButton>
        {pending && <LoadingSpinner />}
      </div>

      <div className="mt-4">
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    </form>
  );
}
