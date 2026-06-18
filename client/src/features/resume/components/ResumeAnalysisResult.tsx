import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";
import type { ResumeAnalysis } from "../api";
import { SkeletonText } from "../../../components/Skeleton";

function AnimatedScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const targetOffset = circumference - (score / 100) * circumference;
    const timeout = setTimeout(() => setOffset(targetOffset), 50);
    return () => clearTimeout(timeout);
  }, [score, circumference]);

  const colorClass =
    score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-rose-500";
  const label = score >= 80 ? "Strong" : score >= 60 ? "Needs focus" : "High priority";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-28 w-28 flex-col items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${colorClass} transition-all duration-[1200ms] ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <span className="z-10 text-4xl font-bold tracking-tight text-slate-950">{score}</span>
        <span className="z-10 text-[10px] font-bold uppercase tracking-wide text-slate-500">ATS score</span>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${colorClass} bg-current/10`}>
        <span className="text-slate-900">{label}</span>
      </span>
    </div>
  );
}

function FeedbackList({
  title,
  items,
  tone,
  icon: Icon,
  empty,
}: {
  title: string;
  items?: string[];
  tone: "emerald" | "rose" | "amber" | "blue";
  icon: typeof CheckCircle2;
  empty: string;
}) {
  const styles = {
    emerald: "border-emerald-100 bg-emerald-50/50 text-emerald-900",
    rose: "border-rose-100 bg-rose-50/50 text-rose-900",
    amber: "border-amber-100 bg-amber-50/50 text-amber-900",
    blue: "border-blue-100 bg-blue-50/50 text-blue-900",
  };

  return (
    <section className={`rounded-2xl border p-5 ${styles[tone]}`}>
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-white/80 p-1.5 shadow-sm">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {items?.length ? (
          items.map((item, i) => (
            <li key={`${title}-${i}`} className="flex gap-3 text-sm leading-6">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-sm leading-6 text-slate-600">{empty}</li>
        )}
      </ul>
    </section>
  );
}

interface ResumeAnalysisResultProps {
  analysis?: ResumeAnalysis;
  isLoading?: boolean;
}

export function ResumeAnalysisResult({ analysis, isLoading }: ResumeAnalysisResultProps) {
  const nextActions = useMemo(() => {
    if (!analysis) return [];
    return [
      analysis.weaknesses?.[0],
      analysis.missingKeywords?.length
        ? `Add relevant keywords: ${analysis.missingKeywords.slice(0, 3).join(", ")}`
        : undefined,
      analysis.finalSuggestions?.[0],
    ].filter(Boolean) as string[];
  }, [analysis]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="soft-panel flex flex-col items-center gap-6 p-6 sm:flex-row">
          <div className="h-28 w-28 shrink-0 animate-pulse rounded-full bg-slate-100" />
          <div className="w-full flex-1">
            <SkeletonText lines={3} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="soft-panel p-6"><SkeletonText lines={5} /></div>
          <div className="soft-panel p-6"><SkeletonText lines={5} /></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const score = analysis.atsScore ?? 0;

  return (
    <div className="space-y-6">
      <section className="soft-panel overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_1fr]">
          <AnimatedScore score={score} />
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <FileSearch className="h-3.5 w-3.5" />
              Analysis complete
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
              Your resume has a clear path to improve.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {analysis.hiringImpression ||
                "We analyzed your resume against ATS and recruiter readability signals."}
            </p>
            {nextActions.length > 0 && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Next actions</p>
                <ul className="mt-3 space-y-2">
                  {nextActions.map((action, index) => (
                    <li key={index} className="flex gap-2 text-sm text-slate-700">
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <FeedbackList
          title="Strengths"
          items={analysis.strengths}
          tone="emerald"
          icon={CheckCircle2}
          empty="No specific strengths highlighted yet."
        />
        <FeedbackList
          title="Areas to improve"
          items={analysis.weaknesses}
          tone="rose"
          icon={AlertTriangle}
          empty="No major weaknesses found. Keep refining for role fit."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FeedbackList
          title="Final suggestions"
          items={analysis.finalSuggestions}
          tone="amber"
          icon={Lightbulb}
          empty="No extra suggestions returned for this analysis."
        />
        <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-blue-900">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/80 p-1.5 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold">Missing keywords</h3>
          </div>
          {analysis.missingKeywords?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {analysis.missingKeywords.map((item, i) => (
                <span key={i} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-800 shadow-sm ring-1 ring-blue-100">
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">No missing keywords were detected.</p>
          )}
        </section>
      </div>

      {analysis.rewrittenBullets?.length ? (
        <section className="soft-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-indigo-700">Bullet rewrites</p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">Make your impact easier to see</h3>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {analysis.rewrittenBullets.map((bullet, i) => (
              <article key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Original</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{bullet.original}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-indigo-600">Improved</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-950">{bullet.improved}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {(analysis.tailoredResume || analysis.tailoredSuggestions?.length) && (
        <section className="soft-panel p-5 sm:p-6">
          <p className="text-sm font-semibold text-brand">Job description tailoring</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">Role-specific guidance</h3>
          {analysis.tailoredSuggestions?.length ? (
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              {analysis.tailoredSuggestions.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {analysis.tailoredResume && (
            <p className="mt-4 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {analysis.tailoredResume}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
