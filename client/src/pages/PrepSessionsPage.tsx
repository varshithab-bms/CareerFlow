import { useMemo, useState, type FormEvent } from "react";
import { AppLayout } from "../components/AppLayout";
import type { AxiosError } from "axios";
import { getErrorMessage } from "../context/AuthContext";
import { PrepMarkdown } from "../features/prep/components/PrepMarkdown";
import { PrepPlanSessions } from "../features/prep/components/PrepPlanSessions";
import { CUSTOM_ROLE_VALUE, JOB_ROLE_PRESETS } from "../features/prep/jobRoles";
import { useGeneratePrepMutation } from "../features/prep/hooks";

export function PrepSessionsPage() {
  const gen = useGeneratePrepMutation();

  const [preset, setPreset] = useState<string>(JOB_ROLE_PRESETS[0] ?? "");
  const [customRole, setCustomRole] = useState("");

  const effectiveRole = useMemo(() => {
    if (preset === CUSTOM_ROLE_VALUE) return customRole.trim();
    return preset;
  }, [preset, customRole]);

  const errorMsg = gen.error ? getErrorMessage(gen.error as AxiosError) : null;

  function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (effectiveRole.length < 2) return;
    gen.mutate(effectiveRole);
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Interview prep
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Pick a job role (or enter your own). We build{" "}
          <span className="font-semibold text-slate-800">three structured sessions</span>{" "}
          offline using curated templates—no LLM API required. Optionally add{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">YOUTUBE_API_KEY</code>{" "}
          on the server for real video links per topic.
        </p>
      </div>

        <form
          onSubmit={handleGenerate}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
        >
          <label
            htmlFor="job-role-preset"
            className="block text-sm font-medium text-slate-700"
          >
            Job role
          </label>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <select
                id="job-role-preset"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-brand/30 focus:border-brand focus:ring-2"
              >
                {JOB_ROLE_PRESETS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
                <option value={CUSTOM_ROLE_VALUE}>Custom role…</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={gen.isPending || effectiveRole.length < 2}
              className="shrink-0 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {gen.isPending ? "Generating…" : "Generate prep plan"}
            </button>
          </div>
          {preset === CUSTOM_ROLE_VALUE ? (
            <div className="mt-4">
              <label
                htmlFor="custom-role"
                className="block text-sm font-medium text-slate-700"
              >
                Custom title
              </label>
              <input
                id="custom-role"
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Staff Backend Engineer — Fintech"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand/30 focus:border-brand focus:ring-2"
              />
            </div>
          ) : null}

          {errorMsg ? (
            <div
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {errorMsg}
            </div>
          ) : null}
        </form>

        {gen.data ? (
          <div className="mt-10 space-y-10">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Plan for
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{gen.data.jobRole}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Engine: {gen.data.model}</p>
                  <p>
                    YouTube:{" "}
                    {gen.data.youtubeConfigured ? (
                      <span className="font-medium text-emerald-700">enabled</span>
                    ) : (
                      <span className="font-medium text-amber-800">optional</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <PrepMarkdown content={gen.data.overviewMarkdown} />
              </div>
            </section>

            <PrepPlanSessions plan={gen.data} />
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-slate-500">
            Generated prep will appear here after you choose a role and generate.
          </p>
        )}
    </AppLayout>
  );
}
