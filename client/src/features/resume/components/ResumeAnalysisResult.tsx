import type { ResumeAnalysis } from "../api";
import { SkeletonText } from "../../../components/Skeleton";
import { useEffect, useState } from "react";

function AnimatedScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const [offset, setOffset] = useState(circumference);
  
  useEffect(() => {
    const targetOffset = circumference - (score / 100) * circumference;
    const timeout = setTimeout(() => {
      setOffset(targetOffset);
    }, 50);
    return () => clearTimeout(timeout);
  }, [score, circumference]);

  const colorClass = 
    score >= 80 ? "text-emerald-500" 
    : score >= 60 ? "text-amber-500" 
    : "text-rose-500";
    
  const verdict = 
    score >= 80 ? "Strong ✓" 
    : score >= 60 ? "Needs Work ⚠" 
    : "Critical ✗";

  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <div className="relative flex h-24 w-24 flex-col items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
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
        <div className="flex flex-col items-center z-10 mt-1">
          <span className="text-3xl font-bold tracking-tighter text-slate-900 leading-none">{score}</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">/ 100</span>
        </div>
      </div>
      <div className={`text-xs font-bold ${colorClass}`}>
        {verdict}
      </div>
    </div>
  );
}

interface ResumeAnalysisResultProps {
  analysis?: ResumeAnalysis;
  isLoading?: boolean;
}

export function ResumeAnalysisResult({ analysis, isLoading }: ResumeAnalysisResultProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-[6px] border-slate-200 bg-slate-100 animate-pulse" />
          <div className="text-center sm:text-left flex-1 w-full">
            <SkeletonText lines={2} />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Strengths</h3>
            <SkeletonText lines={4} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Areas to Improve</h3>
            <SkeletonText lines={4} />
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <AnimatedScore score={analysis.atsScore ?? 0} />
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-semibold text-slate-900">Analysis Complete</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {analysis.hiringImpression || "We analyzed your resume against modern ATS standards."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </span>
            Strengths
          </h3>
          <ul className="mt-4 space-y-3">
            {analysis.strengths && analysis.strengths.length > 0 ? (
              analysis.strengths.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-emerald-800">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">No specific strengths highlighted.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </span>
            Areas to Improve
          </h3>
          <ul className="mt-4 space-y-3">
            {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
              analysis.weaknesses.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-rose-800">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">No weaknesses found. Great job!</li>
            )}
          </ul>
        </div>
      </div>

      {(analysis.finalSuggestions?.length || analysis.missingKeywords?.length) && (
        <div className="grid gap-6 md:grid-cols-2">
          {analysis.finalSuggestions && analysis.finalSuggestions.length > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-6">
              <h3 className="text-sm font-semibold text-amber-900">Final Suggestions</h3>
              <ul className="mt-4 space-y-2">
                {analysis.finalSuggestions.map((item, i) => (
                  <li key={i} className="text-sm text-amber-800">• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-6">
              <h3 className="text-sm font-semibold text-blue-900">Missing Keywords</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {analysis.missingKeywords.map((item, i) => (
                  <span key={i} className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {analysis.rewrittenBullets && analysis.rewrittenBullets.length > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6">
          <h3 className="text-sm font-semibold text-indigo-900 mb-4">Rewritten Bullet Points</h3>
          <div className="space-y-4">
            {analysis.rewrittenBullets.map((bullet, i) => (
              <div key={i} className="rounded-lg bg-white p-4 shadow-sm border border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Original</p>
                <p className="text-sm text-slate-600 mb-3">{bullet.original}</p>
                <p className="text-xs font-medium text-indigo-500 uppercase mb-1">Improved</p>
                <p className="text-sm text-indigo-900">{bullet.improved}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(analysis.tailoredResume || (analysis.tailoredSuggestions && analysis.tailoredSuggestions.length > 0)) && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">JD Tailoring Suggestions</h3>
          {analysis.tailoredSuggestions && analysis.tailoredSuggestions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">What to emphasize</h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {analysis.tailoredSuggestions.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.tailoredResume && (
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Tailored resume guidance</h4>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {analysis.tailoredResume}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
