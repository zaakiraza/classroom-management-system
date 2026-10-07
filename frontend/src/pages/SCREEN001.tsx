import { auth_login } from "../api";
import type { AuthLoginRequest, AuthLoginResponse } from "../generated/types";
import { LoginForm } from "../components/SCREEN001/LoginForm";
import { Card } from "../components/Shared";
import { PRODUCT } from "../flow";

/** POST /auth/login via the generated client, sending the spec fields by name. */
async function signIn(input: AuthLoginRequest): Promise<AuthLoginResponse> {
  const result = await auth_login({ email: input.email, password: input.password });
  return result;
}

/** Login (/login): centered sign-in card for admins, teachers, and students. */
export function SCREEN001() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-teal-800">{PRODUCT}</p>
        <Card className="p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use your school email and password to continue.</p>
          <LoginForm submit={signIn} />
        </Card>
      </div>
    </main>
  );
}
