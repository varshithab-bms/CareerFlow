import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
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
  ExternalLink,
  Mic,
  MicOff,
} from "lucide-react";
import type { AnswerEvaluation, Question, DSAEvaluation } from "../api";
import { useToast } from "../../../context/ToastContext";

interface ActiveSessionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string) => Promise<void>;
  isSubmitting: boolean;
  lastEvaluation?: AnswerEvaluation | DSAEvaluation;
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
  const { showToast } = useToast();
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Detect support once on mount, so we can disable/hide the mic button
  // instead of letting the user click it and hit a dead end.
  useEffect(() => {
    setMicSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (isTranscribing) return;

    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];

        try {
          setIsTranscribing(true);
          const { transcribeAudio } = await import("../api");
          const text = await transcribeAudio(audioBlob);
          if (text) {
            setAnswer((prev) => {
              const newAnswer = prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + text;
              return newAnswer.trimStart();
            });
          }
        } catch (error) {
          console.error("Transcription error:", error);
          const message =
            axios.isAxiosError(error) && error.response?.data?.error?.message
              ? error.response.data.error.message
              : "Failed to transcribe audio. Please try again.";
          showToast(message, "error");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setMicError(null);
    } catch (error) {
      console.error("Microphone access error:", error);
      showToast("Microphone access denied or unavailable. Please enable it in your browser.", "error");
      setMicError("Microphone access denied.");
    }
  };

  useEffect(() => {
    setSeconds(0);
    setAnswer("");
    setShowHints(false);
    setIsPaused(false);
    setMicError(null);
    if (isListening && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isDSA = !!(question as any).problemTitle;
  const diff = ((question as any).difficulty || "medium").toLowerCase();
  const diffColor =
    diff === "easy"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : diff === "hard"
        ? "bg-rose-50 text-rose-700 border-rose-100"
        : "bg-amber-50 text-amber-700 border-amber-100";

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
          <div className="mb-3 flex flex-wrap gap-2">
            {(question as any).category && (
              <div className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {(question as any).category}
              </div>
            )}
            {isDSA && (question as any).topic && (
              <div className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                {(question as any).topic}
              </div>
            )}
          </div>
          {isDSA && (question as any).problemTitle && (
            <h3 className="mb-2 text-lg font-bold text-slate-900">{(question as any).problemTitle}</h3>
          )}
          <h2 className="text-xl font-bold leading-8 text-slate-950">{question.question}</h2>
          {isDSA && (question as any).constraints && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-700">Constraints</p>
              <p className="mt-1 text-sm text-slate-600">{(question as any).constraints}</p>
            </div>
          )}
          {isDSA && (question as any).examples && (question as any).examples.length > 0 && (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-700">Examples</p>
              <ul className="mt-1 space-y-2">
                {(question as any).examples.map((example: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-600 whitespace-pre-wrap">{example}</li>
                ))}
              </ul>
            </div>
          )}
          {isDSA && (question as any).approachHint && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-800">Approach Hint</p>
              <p className="mt-1 text-sm text-amber-700">{(question as any).approachHint}</p>
            </div>
          )}
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
                <span className={
                  isDSA
                    ? ((lastEvaluation as DSAEvaluation).overallScore >= 80 ? "text-emerald-600" : (lastEvaluation as DSAEvaluation).overallScore >= 60 ? "text-amber-600" : "text-rose-600")
                    : ((lastEvaluation as AnswerEvaluation).score >= 8 ? "text-emerald-600" : (lastEvaluation as AnswerEvaluation).score >= 5 ? "text-amber-600" : "text-rose-600")
                }>
                  {isDSA ? `${(lastEvaluation as DSAEvaluation).overallScore}/100` : `${(lastEvaluation as AnswerEvaluation).score}/10`}
                </span>
              </div>
            </div>

            {isDSA ? (
              <DSAEvaluationFeedback evaluation={lastEvaluation as DSAEvaluation} topic={(question as any).topic} />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <FeedbackCard title="Strengths" tone="emerald" items={(lastEvaluation as AnswerEvaluation).strengths} />
                  <FeedbackCard title="Areas to improve" tone="rose" items={(lastEvaluation as AnswerEvaluation).weaknesses} />
                </div>

                {(lastEvaluation as AnswerEvaluation).improvement && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <h4 className="text-sm font-bold text-blue-900">Actionable improvement</h4>
                    <p className="mt-2 text-sm leading-6 text-blue-800">{(lastEvaluation as AnswerEvaluation).improvement}</p>
                  </div>
                )}
              </>
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
                {isDSA ? "Your code solution" : "Your response"}
              </label>
              {isDSA && (question as any).problemTitle && (
                <a
                  href={`https://leetcode.com/search/?q=${encodeURIComponent((question as any).problemTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on LeetCode
                </a>
              )}
            </div>
            {isDSA ? (
              <Editor
                height="500px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={answer}
                onChange={(value) => setAnswer(value ?? "")}
                options={{
                  fontSize: 16,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="relative">
                <textarea
                  id="answer"
                  rows={isDSA ? 12 : 8}
                  required
                  value={answer}
                  disabled={isPaused}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={isDSA ? "Write your code solution here..." : "Type your answer here. Use a clear situation, action, and result when possible."}
                  className={`focus-ring w-full resize-y rounded-2xl border px-4 py-3 text-sm leading-6 focus:border-brand disabled:cursor-not-allowed disabled:bg-slate-100 ${isDSA
                      ? "font-mono text-base bg-slate-900 text-slate-100 border-slate-700 focus:bg-slate-900 placeholder:text-slate-500"
                      : "bg-slate-50 text-slate-800 border-slate-200 focus:bg-white placeholder:text-slate-400"
                    }`}
                />
                {isTranscribing && (
                  <div className="mt-2 text-sm font-medium text-amber-600 flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                    Transcribing audio...
                  </div>
                )}
                {!isDSA && micSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isPaused || isTranscribing}
                    className={`absolute bottom-3 right-3 rounded-full p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isListening
                        ? "bg-rose-100 text-rose-600 hover:bg-rose-200 animate-pulse"
                        : isTranscribing
                          ? "bg-amber-100 text-amber-600 animate-pulse"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    title={isListening ? "Stop listening" : isTranscribing ? "Transcribing..." : "Start dictating"}
                  >
                    {isListening ? <Mic className="h-5 w-5" /> : isTranscribing ? <Mic className="h-5 w-5 opacity-50" /> : <MicOff className="h-5 w-5" />}
                  </button>
                )}
              </div>
            )}
            {!isDSA && micError && (
              <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {micError}
              </div>
            )}
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

function DSAEvaluationFeedback({
  evaluation,
  topic,
}: {
  evaluation: DSAEvaluation;
  topic?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-slate-900">Correctness</h4>
          <p className="mt-2 text-2xl font-bold text-slate-700">{evaluation.correctness}/10</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-slate-900">Code Quality</h4>
          <p className="mt-2 text-lg font-bold text-slate-700">{evaluation.codeQuality}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-slate-900">Time Complexity</h4>
          <p className="mt-2 text-sm font-mono text-slate-700">{evaluation.timeComplexity}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-bold text-slate-900">Space Complexity</h4>
          <p className="mt-2 text-sm font-mono text-slate-700">{evaluation.spaceComplexity}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="text-sm font-bold text-slate-900">Edge Cases</h4>
        <p className={`mt-2 text-sm font-bold ${evaluation.edgeCasesCovered ? "text-emerald-600" : "text-rose-600"}`}>
          {evaluation.edgeCasesCovered ? "Covered" : "Not covered"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FeedbackCard title="Strengths" tone="emerald" items={evaluation.strengths} />
        <FeedbackCard title="Areas to improve" tone="rose" items={evaluation.weaknesses} />
      </div>

      {evaluation.suggestions && evaluation.suggestions.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <h4 className="text-sm font-bold text-blue-900">Suggestions</h4>
          <ul className="mt-3 space-y-2">
            {evaluation.suggestions.map((suggestion: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm leading-6 text-blue-800">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {topic && (
        <a
          href={`https://leetcode.com/tag/${topic.toLowerCase().replace(/\s+/g, "-")}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          Find similar problems on LeetCode
        </a>
      )}
    </div>
  );
}
