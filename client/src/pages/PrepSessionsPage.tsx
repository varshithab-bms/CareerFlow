import { useMemo, useRef, useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import { ArrowRight, BookOpen, Briefcase, CalendarDays, ListChecks, Loader2, Video } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { getErrorMessage } from "../context/AuthContext";
import { PrepMarkdown } from "../features/prep/components/PrepMarkdown";
import { PrepPlanSessions } from "../features/prep/components/PrepPlanSessions";
import { CUSTOM_ROLE_VALUE, JOB_ROLE_PRESETS } from "../features/prep/jobRoles";
import { useGeneratePrepMutation } from "../features/prep/hooks";

export function PrepSessionsPage() {
  const gen = useGeneratePrepMutation();
  const [preset, setPreset] = useState<string>(JOB_ROLE_PRESETS[0] ?? "");
  const [customRole, setCustomRole] = useState("");
  const roleSelectRef = useRef<HTMLSelectElement>(null);

  const effectiveRole = useMemo(() => {
    if (preset === CUSTOM_ROLE_VALUE) return customRole.trim();
    return preset;
  }, [preset, customRole]);

  const rawError = gen.error ? getErrorMessage(gen.error as AxiosError) : null;
  const errorMsg = rawError?.toLowerCase().includes("too many")
    ? "Gemini is temporarily rate limited. Wait a minute, then generate again."
    : rawError;

  function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (effectiveRole.length < 2) return;
    gen.mutate(effectiveRole);
  }

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-label text-brand">Prep Sessions</p>
          <h1 className="mt-2 text-display text-ink">
            Build a focused interview roadmap.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Pick a role and generate three structured sessions with topics,
            objectives, and learning resources.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.3fr]">
        <aside className="soft-panel p-6">
          <div className="inline-flex rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            From broad role to daily practice.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            CareerFlow turns your target title into a short prep plan you can
            complete, review, and convert into tasks.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              { label: "Three interview-focused sessions", icon: CalendarDays },
              { label: "Role-specific topics", icon: ListChecks },
              { label: "Optional video resources", icon: Video },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-sm font-medium text-slate-700">
                <Icon className="h-4 w-4 text-accent-deep" />
                {label}
              </div>
            ))}
          </div>
        </aside>

        <form onSubmit={handleGenerate} className="soft-panel p-5 sm:p-6">
          <div>
            <p className="text-sm font-semibold text-brand">Plan setup</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Choose your target role</h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label htmlFor="job-role-preset" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Briefcase className="h-4 w-4 text-brand" />
                Job role
              </label>
              <select
                id="job-role-preset"
                ref={roleSelectRef}
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand"
              >
                {JOB_ROLE_PRESETS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
                <option value={CUSTOM_ROLE_VALUE}>Custom role...</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={gen.isPending || effectiveRole.length < 2}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {gen.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating
                </>
              ) : (
                <>
                  Generate plan
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {preset === CUSTOM_ROLE_VALUE && (
            <div className="mt-4">
              <label htmlFor="custom-role" className="mb-2 block text-sm font-semibold text-slate-800">
                Custom title
              </label>
              <input
                id="custom-role"
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Staff Backend Engineer - Fintech"
                className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand"
              />
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800" role="alert">
              {errorMsg}
            </div>
          )}
        </form>
      </div>

      {gen.isPending && (
        <div className="mt-8 soft-panel flex items-center gap-4 p-5">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <div>
            <p className="font-semibold text-slate-950">Generating your prep roadmap</p>
            <p className="mt-1 text-sm text-slate-600">This can take a few seconds if Gemini is busy.</p>
          </div>
        </div>
      )}

      {gen.data ? (
        <div className="mt-8 space-y-6">
          <section className="soft-panel p-5 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Plan for</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{gen.data.jobRole}</p>
              </div>
              <div className="grid gap-2 text-xs text-slate-500 sm:text-right">
                <p>Engine: <span className="font-semibold text-slate-700">{gen.data.model}</span></p>
                <p className="inline-flex items-center gap-1.5 sm:justify-end">
                  <Video className="h-3.5 w-3.5" />
                  YouTube:{" "}
                  {gen.data.youtubeConfigured ? (
                    <span className="font-semibold text-emerald-700">enabled</span>
                  ) : (
                    <span className="font-semibold text-amber-700">optional</span>
                  )}
                </p>
              </div>
            </div>
            <div className="pt-5">
              <PrepMarkdown content={gen.data.overviewMarkdown} />
            </div>
          </section>

          <PrepPlanSessions plan={gen.data} />
        </div>
      ) : !gen.isPending ? (
        <div className="mt-8 border border-accent/40 bg-accent-soft/60 p-7 text-center sm:p-8">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-700">
            Choose your target role to build a focused prep roadmap for your next interview.
          </p>
          <button
            type="button"
            onClick={() => {
              document.getElementById("job-role-preset")?.scrollIntoView({ behavior: "smooth", block: "center" });
              roleSelectRef.current?.focus({ preventScroll: true });
            }}
            className="focus-ring mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-dark"
          >
            Choose a role
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </AppLayout>
  );
}
