import { useState } from "react";
import { Activity, ArrowRight, Briefcase, Clock3, Gauge, MessageSquareText, Mic2, PanelTop, Radio, Timer } from "lucide-react";
import type { Difficulty, InterviewType, DSATopic } from "../api";

interface InterviewSetupProps {
  onStart: (role: string, difficulty: Difficulty, type?: InterviewType, topic?: DSATopic) => void;
  isLoading: boolean;
}

const difficultyCopy: Record<Difficulty, string> = {
  easy: "Warm-up questions with lighter depth.",
  medium: "Balanced role and scenario practice.",
  hard: "Deeper trade-offs and follow-ups.",
};

const interviewTypeCopy: Record<InterviewType, string> = {
  behavioral: "Soft skills, culture fit, and behavioral questions.",
  technical: "Technical concepts, problem-solving, and system design.",
  dsa: "Coding problems with algorithmic challenges.",
};

const ALL_DSA_TOPICS: DSATopic[] = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Hash Tables",
  "Trees",
  "Binary Search Trees",
  "Heaps",
  "Graphs",
  "Recursion",
  "Backtracking",
  "Dynamic Programming",
  "Greedy",
  "Sliding Window",
  "Two Pointers",
  "Sorting & Searching",
];

const getRecommendedTopics = (role: string): DSATopic[] => {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes("frontend") || lowerRole.includes("web")) {
    return ["Arrays", "Strings", "Hash Tables", "Sliding Window"];
  }
  if (lowerRole.includes("backend") || lowerRole.includes("server")) {
    return ["Trees", "Graphs", "Hash Tables", "Heaps"];
  }
  if (lowerRole.includes("ai") || lowerRole.includes("ml") || lowerRole.includes("machine learning")) {
    return ["Arrays", "Graphs", "Dynamic Programming"];
  }
  return [];
};

export function InterviewSetup({ onStart, isLoading }: InterviewSetupProps) {
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("technical");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState<DSATopic | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role.trim()) {
      if (interviewType === "dsa" && !topic) {
        return;
      }
      onStart(role.trim(), difficulty, interviewType, topic || undefined);
    }
  };

  const recommendedTopics = getRecommendedTopics(role);

  const sessionTypeLabel = interviewType === "dsa" ? "DSA practice" : `${interviewType} interview`;

  return (
    <form onSubmit={handleSubmit} className="soft-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-stone-200 bg-surface-muted/70 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-label text-brand">
            <Radio className="h-4 w-4 text-accent-deep" />
            Live session setup
          </div>
          <h2 className="mt-2 text-title text-ink">Configure your next interview</h2>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs font-bold text-ink">
          <Activity className="h-3.5 w-3.5 text-accent-deep" />
          Ready when you are
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6 p-5 sm:p-6">
          <div>
          <label htmlFor="role" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Briefcase className="h-4 w-4 text-brand" />
            Target role
          </label>
          <input
            id="role"
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="focus-ring w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand"
            placeholder="Frontend Developer, Product Manager, Data Analyst"
          />
          </div>

          <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Mic2 className="h-4 w-4 text-brand" />
            Interview type
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["behavioral", "technical", "dsa"] as InterviewType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setInterviewType(type);
                  if (type !== "dsa") setTopic("");
                }}
                className={`focus-ring rounded-2xl border p-4 text-left transition ${
                  interviewType === type
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm font-bold capitalize">{type}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  {interviewTypeCopy[type]}
                </span>
              </button>
            ))}
          </div>
          </div>

          {interviewType === "dsa" && (
            <div>
            <label htmlFor="topic" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Gauge className="h-4 w-4 text-brand" />
              DSA Topic
            </label>
            <select
              id="topic"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value as DSATopic)}
              className="focus-ring w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-brand"
            >
              <option value="">Select a topic</option>
              {recommendedTopics.length > 0 && (
                <optgroup label="Recommended for your role">
                  {recommendedTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="All topics">
                {ALL_DSA_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </optgroup>
            </select>
            </div>
          )}

          <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Gauge className="h-4 w-4 text-brand" />
            Difficulty level
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`focus-ring rounded-2xl border p-4 text-left transition ${
                  difficulty === level
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm font-bold capitalize">{level}</span>
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  {difficultyCopy[level]}
                </span>
              </button>
            ))}
          </div>
          </div>
        </div>

        <aside className="border-t border-stone-200 bg-surface-muted/45 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-label text-ink-muted">Session at a glance</p>
          <div className="mt-5 space-y-5">
            <div className="flex gap-3">
              <PanelTop className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" />
              <div><p className="text-sm font-bold capitalize text-ink">{sessionTypeLabel}</p><p className="mt-1 text-xs leading-5 text-ink-muted">Five focused questions with room to think between responses.</p></div>
            </div>
            <div className="flex gap-3">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" />
              <div><p className="text-sm font-bold text-ink">Self-paced timing</p><p className="mt-1 text-xs leading-5 text-ink-muted">Draft and submit each answer when you are ready.</p></div>
            </div>
            <div className="flex gap-3">
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" />
              <div><p className="text-sm font-bold text-ink">Feedback after every response</p><p className="mt-1 text-xs leading-5 text-ink-muted">Use scoring notes to sharpen the next answer.</p></div>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-col gap-3 border-t border-stone-200 bg-surface-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-ink-muted">Your session starts as soon as you choose a role.</p>
        <button
          type="submit"
          disabled={!role.trim() || isLoading || (interviewType === "dsa" && !topic)}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Preparing session..." : "Start live session"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}
