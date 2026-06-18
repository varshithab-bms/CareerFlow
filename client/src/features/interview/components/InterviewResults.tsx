import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Home, RotateCcw } from "lucide-react";
import type { Interview } from "../api";

interface InterviewResultsProps {
  interview: Interview;
  onRetake?: () => void;
}

export function InterviewResults({ interview, onRetake }: InterviewResultsProps) {
  const finalScore = interview.finalScore ?? 0;
  const scoreColor =
    finalScore >= 80
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : finalScore >= 60
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  const averageQuestionScore =
    interview.answers?.length
      ? Math.round(
          interview.answers.reduce((total: number, answer: any) => total + (answer.score ?? 0), 0) /
            interview.answers.length
        )
      : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="soft-panel overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[auto_1fr]">
          <div className={`flex h-32 w-32 flex-col items-center justify-center rounded-full border-8 ${scoreColor}`}>
            <span className="text-4xl font-bold">{finalScore}</span>
            <span className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">Final</span>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-brand">Interview complete</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {interview.role} session summary
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Review your answers, identify patterns, and retake the session when
              you are ready to improve the weak spots.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Questions" value={String(interview.answers?.length ?? 0)} />
              <Metric label="Avg answer" value={`${averageQuestionScore}/10`} />
              <Metric label="Difficulty" value={interview.difficulty ?? "medium"} />
            </div>
          </div>
        </div>
      </section>

      <section className="soft-panel p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-brand" />
          <h3 className="text-lg font-bold text-slate-950">Question-by-question review</h3>
        </div>

        <div className="space-y-4">
          {interview.answers?.length ? (
            interview.answers.map((answer: any, index: number) => (
              <article key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="text-sm font-bold leading-6 text-slate-950">
                    Q{index + 1}: {interview.questions?.[index]?.question}
                  </p>
                  <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                    {answer.score}/10
                  </span>
                </div>
                <div className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-600 ring-1 ring-slate-200">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Your answer</p>
                  <p className="line-clamp-3 leading-6">{answer.answer}</p>
                </div>
                {answer.improvement && (
                  <div className="mt-3 text-sm leading-6 text-slate-700">
                    <span className="font-bold text-slate-900">Improve next time: </span>
                    {answer.improvement}
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">No detailed answers returned.</p>
              <p className="mt-1 text-xs text-slate-500">Your final score is still available above.</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          to="/dashboard"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <button
          onClick={onRetake}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Retake
        </button>
        <Link
          to="/resume-enhancer"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
        >
          Improve resume
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold capitalize text-slate-950">{value}</p>
    </div>
  );
}
