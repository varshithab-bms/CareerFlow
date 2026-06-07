import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Question, AnswerEvaluation } from "../api";

interface ActiveSessionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string) => Promise<void>;
  isSubmitting: boolean;
  lastEvaluation?: AnswerEvaluation;
  onNextQuestion?: () => void;
  isComplete?: boolean;
}

export function ActiveSession({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  isSubmitting,
  lastEvaluation,
  onNextQuestion,
  isComplete,
}: ActiveSessionProps) {
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [showHints, setShowHints] = useState(false);

  // Reset timer on new question
  useEffect(() => {
    setSeconds(0);
    setShowHints(false);
  }, [question.id]);

  useEffect(() => {
    // Only run timer if not evaluating
    if (lastEvaluation) return;

    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastEvaluation, question.id]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      await onSubmitAnswer(answer.trim());
      setAnswer("");
    }
  };

  const diff = ((question as any).difficulty || "medium").toLowerCase();
  const diffColor = 
    diff === "easy" ? "bg-emerald-100 text-emerald-700" :
    diff === "hard" ? "bg-rose-100 text-rose-700" :
    "bg-amber-100 text-amber-700";

  const wordCount = answer.trim().length > 0 ? answer.trim().split(/\s+/).length : 0;
  const wordCountColor = wordCount < 30 ? "text-amber-600" : wordCount > 80 ? "text-emerald-600" : "text-slate-500";

  const getHints = () => {
    const category = ((question as any).category || "").toLowerCase();
    if (category === "fundamentals") {
      return [
        "Define the concept clearly",
        "Give a real-world example",
        "Mention trade-offs"
      ];
    } else if (category === "practical") {
      return [
        "Describe the problem context",
        "Walk through your approach step by step",
        "Share the outcome or lesson"
      ];
    } else if (category === "design") {
      return [
        "Clarify requirements first",
        "Think out loud about trade-offs",
        "Mention scalability"
      ];
    } else {
      return [
        "Be specific and concise",
        "Use the STAR method if applicable",
        "Quantify your impact"
      ];
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div 
          className="h-full bg-brand transition-all duration-500 ease-out" 
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <div className="flex items-center gap-3">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${diffColor}`}>
            {(question as any).difficulty || "Medium"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 font-mono text-slate-600 border border-slate-200 shadow-sm">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {formatTime(seconds)}
          </div>
          {isComplete && <span className="text-brand font-semibold">Final</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        {(question as any).category && (
          <div className="mb-3 inline-block rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
            {(question as any).category}
          </div>
        )}
        <h2 className="text-lg font-semibold text-slate-900 leading-relaxed">
          {question.question}
        </h2>
        
        {lastEvaluation ? (
          <div className="mt-8 space-y-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Feedback</h3>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <span className="text-sm font-medium text-slate-600">Score:</span>
                <span className={`text-sm font-bold ${lastEvaluation.score >= 8 ? 'text-emerald-600' : lastEvaluation.score >= 5 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {lastEvaluation.score}/10
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <h4 className="text-sm font-medium text-emerald-900 mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {lastEvaluation.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-emerald-800 flex gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                <h4 className="text-sm font-medium text-rose-900 mb-2">Areas to Improve</h4>
                <ul className="space-y-1">
                  {lastEvaluation.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-rose-800 flex gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {lastEvaluation.improvement && (
              <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Suggested Improvement</h4>
                <p className="text-sm text-blue-800 leading-relaxed">{lastEvaluation.improvement}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={onNextQuestion}
                className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
              >
                {isComplete ? "View Final Results" : "Next Question"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="answer" className="sr-only">Your answer</label>
            <textarea
              id="answer"
              rows={6}
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be as detailed as possible."
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-slate-900 outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition-all"
            />
            
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs font-medium ${wordCountColor}`}>
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
              
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition"
              >
                Need a hint?
                {showHints ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {showHints && (
              <div className="mt-3 rounded-xl bg-amber-50/50 p-4 border border-amber-100/50 transition-all">
                <h4 className="text-xs font-semibold text-amber-900 mb-2 uppercase tracking-wide">Quick Tips</h4>
                <ul className="space-y-1.5">
                  {getHints().map((hint, i) => (
                    <li key={i} className="text-sm text-amber-800 flex gap-2">
                      <span className="mt-0.5 shrink-0 text-amber-500">•</span>
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={!answer.trim() || isSubmitting}
                className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Evaluating..." : "Submit Answer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
