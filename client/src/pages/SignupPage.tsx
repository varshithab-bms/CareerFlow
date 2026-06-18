import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { getErrorMessage, useAuth } from "../context/AuthContext";

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const blockedDomains = new Set([
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "example.com",
  "test.com",
  "invalid.com",
]);

function validateSignup(name: string, email: string, password: string): SignupErrors {
  const errors: SignupErrors = {};
  const normalizedEmail = email.trim().toLowerCase();
  const domain = normalizedEmail.split("@")[1];

  if (name.trim().length > 60) {
    errors.name = "Name must be 60 characters or less.";
  }

  if (!normalizedEmail) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  } else if (
    !domain ||
    blockedDomains.has(domain) ||
    domain.endsWith(".test") ||
    domain.endsWith(".invalid") ||
    domain.endsWith(".localhost")
  ) {
    errors.email = "Use a real personal or work email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export function SignupPage() {
  const { signup, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isReady, isAuthenticated, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const nextErrors = validateSignup(name, email, password);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await signup({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim() || undefined,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err as AxiosError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              Email-first account setup
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Create one account for all your interview prep.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Your resume feedback, mock interviews, and prep tasks stay connected to your email.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-slate-200">Email account rules</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Valid email format</span>
                  <span className="text-emerald-300">Required</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Disposable emails</span>
                  <span className="text-rose-300">Blocked</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Password length</span>
                  <span className="text-emerald-300">8+ chars</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="w-full">
          <div className="mb-6 text-center lg:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg outline-none ring-white/30 focus-visible:ring-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-bold text-brand">
                CF
              </span>
              <span className="text-lg font-semibold">CareerFlow</span>
            </Link>
            <h2 className="mt-8 text-3xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Sign up with a valid email and password.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl shadow-black/20 sm:p-8">
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <div className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Only valid personal or work emails can create accounts.</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Name <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                  />
                </div>
                {fieldErrors.name && (
                  <p id="name-error" className="mt-1.5 text-xs font-medium text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
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
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? "email-error" : "email-help"}
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                  />
                </div>
                {fieldErrors.email ? (
                  <p id="email-error" className="mt-1.5 text-xs font-medium text-red-600">
                    {fieldErrors.email}
                  </p>
                ) : (
                  <p id="email-help" className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Disposable and test emails are not accepted.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "password-error" : "password-help"}
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                  />
                </div>
                {fieldErrors.password ? (
                  <p id="password-error" className="mt-1.5 text-xs font-medium text-red-600">
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p id="password-help" className="mt-1.5 text-xs text-slate-500">
                    At least 8 characters.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account
                  </>
                ) : (
                  <>
                    Create account with email
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
