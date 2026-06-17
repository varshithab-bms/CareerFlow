import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { getErrorMessage, useAuth } from "../context/AuthContext";

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
};

function validateSignup(name: string, email: string, password: string): SignupErrors {
  const errors: SignupErrors = {};
  if (name.trim().length > 60) {
    errors.name = "Name must be 60 characters or less.";
  }
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
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
        email: email.trim(),
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
              Built for visible career momentum
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Build a workspace recruiters can understand in seconds.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Organize your prep, sharpen your resume, and practice answers before the interview calendar fills up.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-medium text-slate-200">Demo-ready workflow</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Upload resume</span>
                  <span className="text-emerald-300">Analyze</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Choose target role</span>
                  <span className="text-emerald-300">Practice</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Track follow-ups</span>
                  <span className="text-emerald-300">Ship</span>
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
              Start with a focused workspace for interviews and applications.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl shadow-black/20 sm:p-8">
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
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" className="mt-1.5 text-xs font-medium text-red-600">
                    {fieldErrors.email}
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
                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none ring-brand/30 transition focus:border-brand focus:ring-2"
                  />
                </div>
                {fieldErrors.password ? (
                  <p id="password-error" className="mt-1.5 text-xs font-medium text-red-600">
                    {fieldErrors.password}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-500">At least 8 characters.</p>
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
                    Create account
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
