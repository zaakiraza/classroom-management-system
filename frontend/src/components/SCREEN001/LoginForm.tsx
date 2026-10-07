import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthLoginRequest, AuthLoginResponse } from "../../generated/types";
import { ApiError } from "../../http";
import { ErrorBanner } from "./ErrorBanner";
import { PasswordField } from "./PasswordField";
import { PrimaryButton } from "./PrimaryButton";
import { TextField } from "./TextField";

const ROLE_HOME: Record<"admin" | "teacher" | "student", string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

/** Email/password sign-in for every role; redirects to the role home on success. */
export function LoginForm({ submit }: { submit: (body: AuthLoginRequest) => Promise<AuthLoginResponse> }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const nextEmailError = email.trim() ? undefined : "Email is required.";
    const nextPasswordError = password ? undefined : "Password is required.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setPending(true);
    try {
      const result = await submit({ email: email.trim(), password });
      navigate(result.home || ROLE_HOME[result.role] || "/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Invalid email or password."
          : err instanceof Error && err.message
            ? err.message
            : "Unable to sign in. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-6">
      <ErrorBanner>{error}</ErrorBanner>
      <fieldset disabled={pending} className="mt-2 space-y-4">
        <legend className="sr-only">Sign in details</legend>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (emailError) setEmailError(undefined);
          }}
          error={emailError}
          required
          autoComplete="email"
          placeholder="you@school.edu"
        />
        <PasswordField
          id="login-secret"
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (passwordError) setPasswordError(undefined);
          }}
          error={passwordError}
          required
          autoComplete="current-password"
          placeholder="Your password"
        />
      </fieldset>
      <div className="mt-6">
        <PrimaryButton type="submit" pending={pending} className="w-full">
          Sign in
        </PrimaryButton>
      </div>
    </form>
  );
}
