import type { Interview } from "../api";
import { Link } from "react-router-dom";

interface InterviewResultsProps {
  interview: Interview;
}

export function InterviewResults({ interview }: InterviewResultsProps) {
  const scoreColor = 
    (interview.finalScore ?? 0) >= 80 
      ? "text-emerald-600 border-emerald-200 bg-emerald-50" 
      : (interview.finalScore ?? 0) >= 60 
      ? "text-amber-600 border-amber-200 bg-amber-50" 
      : "text-rose-600 border-rose-200 bg-rose-50";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Interview Complete!</h2>
        <p className="mt-2 text-slate-600">
          You have completed the mock interview for the <span className="font-semibold text-slate-900">{interview.role}</span> role.
        </p>
      </div>

      <div className={`mx-auto flex h-32 w-32 flex-col items-center justify-center rounded-full border-8 ${scoreColor}`}>
        <span className="text-4xl font-bold">{interview.finalScore ?? 0}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Score</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h3 className="font-semibold text-slate-900 mb-6">Performance Summary</h3>
        
        <div className="space-y-6">
          {interview.answers?.map((answer: any, index: number) => (
            <div key={index} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
              <div className="flex justify-between items-start gap-4 mb-3">
                <p className="text-sm font-medium text-slate-900 flex-1">
                  Q{index + 1}: {interview.questions?.[index]?.question}
                </p>
                <span className="shrink-0 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                  {answer.score}/10
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mb-3">
                <p className="font-medium text-slate-700 mb-1 text-xs uppercase">Your Answer</p>
                <p className="line-clamp-3">{answer.answer}</p>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">Feedback: </span>
                {answer.improvement}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Link
          to="/dashboard"
          className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
        >
          Start Another Interview
        </button>
      </div>
    </div>
  );
}
