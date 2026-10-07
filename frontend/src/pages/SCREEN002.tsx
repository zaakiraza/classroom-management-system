import { useSearchParams } from "react-router-dom";
import { auth_set_password } from "../api";
import type { AuthSetPasswordRequest } from "../generated/types";
import { Card, ErrorMessage } from "../components/Shared";
import { SetPasswordForm } from "../components/SCREEN002/SetPasswordForm";

/** POST /auth/set-password via the generated client, sending the spec fields by name. */
async function setPassword(input: AuthSetPasswordRequest): Promise<void> {
  await auth_set_password({ token: input.token, password: input.password });
}

/** Set Password (/set-password): first-time password set from an emailed link token. */
export function SCREEN002() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[color:var(--ink)]">Set password</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Choose a new password to finish setting up your school account.
        </p>
      </header>

      <Card className="p-6 sm:p-8">
        {token ? (
          <SetPasswordForm token={token} submit={setPassword} />
        ) : (
          <ErrorMessage>This link is missing its token. Ask your administrator to resend it.</ErrorMessage>
        )}
      </Card>
    </main>
  );
}
