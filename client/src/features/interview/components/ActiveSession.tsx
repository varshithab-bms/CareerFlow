import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Send,
  Timer,
} from "lucide-react";
import type { AnswerEvaluation, Question } from "../api";

interface ActiveSessionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string) => Promise<void>;
  isSubmitting: boolean;
  lastEvaluation?: AnswerEvaluation;
  onNextQuestion?: () => void;
  isComplete?: boolean;
  onRetake?: () => void;
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
  onRetake,
}: ActiveSessionProps) {
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setSeconds(0);
    setAnswer("");
    setShowHints(false);
    setIsPaused(false);
  }, [question.id]);

  useEffect(() => {
    if (lastEvaluation || isPaused) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [lastEvaluation, question.id, isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !isPaused) {
      await onSubmitAnswer(answer.trim());
    }
  };

  const diff = ((question as any).difficulty || "medium").toLowerCase();
  const diffColor =
    diff === "easy"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : diff === "hard"
        ? "bg-rose-50 text-rose-700 border-rose-100"
        : "bg-amber-50 text-amber-700 border-amber-100";

  const wordCount = answer.trim().length > 0 ? answer.trim().split(/\s+/).length : 0;
  const progress = Math.min(100, (questionNumber / totalQuestions) * 100);

  const hints = useMemo(() => {
    const category = ((question as any).category || "").toLowerCase();
    if (category === "fundamentals") {
      return ["Define the concept clearly", "Give a real-world example", "Mention trade-offs"];
    }
    if (category === "practical") {
      return ["Describe the problem context", "Walk through your approach", "Share the outcome"];
    }
    if (category === "design") {
      return ["Clarify requirements first", "Compare trade-offs", "Mention scalability"];
    }
    return ["Be specific and concise", "Use STAR when applicable", "Quantify your impact"];
  }, [question]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="soft-panel p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Question {questionNumber} of {totalQuestions}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Answer naturally, then review feedback before advancing.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${diffColor}`}>
              {(question as any).difficulty || "Medium"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-bold text-slate-600">
              <Timer className="h-3.5 w-3.5 text-slate-400" />
              {formatTime(seconds)}
            </span>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="soft-panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          {(question as any).category && (
            <div className="mb-3 inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {(question as any).category}
            </div>
          )}
          <h2 className="text-xl font-bold leading-8 text-slate-950">{question.question}</h2>
        </div>

        {lastEvaluation ? (
          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand">Feedback</p>
                <h3 className="text-xl font-bold text-slate-950">Review before moving on</h3>
              </div>
              <div className="w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Score{" "}
                <span className={lastEvaluation.score >= 8 ? "text-emerald-600" : lastEvaluation.score >= 5 ? "text-amber-600" : "text-rose-600"}>
                  {lastEvaluation.score}/10
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FeedbackCard title="Strengths" tone="emerald" items={lastEvaluation.strengths} />
              <FeedbackCard title="Areas to improve" tone="rose" items={lastEvaluation.weaknesses} />
            </div>

            {lastEvaluation.improvement && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <h4 className="text-sm font-bold text-blue-900">Actionable improvement</h4>
                <p className="mt-2 text-sm leading-6 text-blue-800">{lastEvaluation.improvement}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              {onRetake && (
                <button
                  type="button"
                  onClick={onRetake}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </button>
              )}
              <button
                type="button"
                onClick={onNextQuestion}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
              >
                {isComplete ? "View final results" : "Next question"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor="answer" className="text-sm font-bold text-slate-800">
                Your response
              </label>
              <span className={`text-xs font-bold ${wordCount < 30 ? "text-amber-600" : "text-emerald-600"}`}>
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            </div>

            <textarea
              id="answer"
              rows={8}
              required
              value={answer}
              disabled={isPaused}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here. Use a clear situation, action, and result when possible."
              className="focus-ring w-full resize-y rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-brand focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            {isPaused && (
              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                Session paused. Resume when you are ready to continue typing.
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Hints
                {showHints ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsPaused((current) => !current)}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  type="submit"
                  disabled={!answer.trim() || isSubmitting || isPaused}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Evaluating..." : "Submit answer"}
                </button>
              </div>
            </div>

            {showHints && (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-amber-900">Quick tips</h4>
                <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                  {hints.map((hint) => (
                    <li key={hint} className="rounded-xl bg-white/70 px-3 py-2 text-sm leading-5 text-amber-900 shadow-sm">
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        )}
      </section>
    </div>
  );
}

function FeedbackCard({
  title,
  items,
  tone,
}: {
  title: string;
  items?: string[];
  tone: "emerald" | "rose";
}) {
  const className =
    tone === "emerald"
      ? "border-emerald-100 bg-emerald-50 text-emerald-900"
      : "border-rose-100 bg-rose-50 text-rose-900";

  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <h4 className="text-sm font-bold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items?.length ? (
          items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-6">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-slate-600">No feedback returned for this category.</li>
        )}
      </ul>
    </div>
  );
}
