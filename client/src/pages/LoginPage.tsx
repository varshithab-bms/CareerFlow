import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { getErrorMessage, useAuth } from "../context/AuthContext";

type LoginErrors = {
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function LoginPage() {
  const { login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname ??
    "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isReady, isAuthenticated, navigate, from]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const nextErrors = validateLogin(email, password);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err as AxiosError));
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Track your job preparation in one place
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white">
              Continue where you left off.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Access your resume feedback, interview practice sessions, and
              preparation tasks from one account.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                "Resume insights",
                "Interview practice",
                "Progress tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 backdrop-blur-sm transition hover:bg-white/10"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="w-full">
          <div className="mb-6 text-center lg:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg outline-none ring-white/30 focus-visible:ring-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand shadow-lg">
                CF
              </span>
              <span className="text-lg font-semibold">CareerFlow</span>
            </Link>

            <h2 className="mt-8 text-3xl font-bold tracking-tight">
              Welcome back to CareerFlow
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              Sign in to access your personalized career dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl shadow-black/30 sm:p-8">
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <div className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Use the email address you registered with to access your saved
                  progress.
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "email-error" : "email-help"
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                  />
                </div>

                {fieldErrors.email ? (
                  <p
                    id="email-error"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.email}
                  </p>
                ) : (
                  <p
                    id="email-help"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Enter the email address associated with your account.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);

                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: undefined,
                        }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : undefined
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                  />
                </div>

                {fieldErrors.password && (
                  <p
                    id="password-error"
                    className="mt-1.5 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              New to CareerFlow?{" "}
              <Link
                to="/signup"
                className="font-semibold text-brand transition hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};