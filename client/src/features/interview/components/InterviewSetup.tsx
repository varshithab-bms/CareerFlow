import { useState } from "react";
import { ArrowRight, Briefcase, Clock3, Gauge, MessageSquareText, Mic2, PanelTop } from "lucide-react";
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

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.2fr]">
      <aside className="soft-panel p-6">
        <div className="inline-flex rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-700">
          <Mic2 className="h-5 w-5" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
          Practice like a real interview, without the pressure.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Answer one question at a time, pause when needed, then review score-based
          feedback before moving forward.
        </p>
        <div className="mt-6 grid gap-3">
          {[
            { label: "Focused question display", icon: PanelTop },
            { label: "Timed answer drafting", icon: Clock3 },
            { label: "Instant feedback and next steps", icon: MessageSquareText },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-sm font-medium text-slate-700">
              <Icon className="h-4 w-4 text-accent-deep" />
              {label}
            </div>
          ))}
        </div>
      </aside>

      <form onSubmit={handleSubmit} className="soft-panel p-5 sm:p-6">
        <div>
          <p className="text-sm font-semibold text-brand">Session setup</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Configure interview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Choose a target role and difficulty. You can retake the session anytime.
          </p>
        </div>

        <div className="mt-6">
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

        <div className="mt-6">
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
          <div className="mt-6">
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

        <div className="mt-6">
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

        <button
          type="submit"
          disabled={!role.trim() || isLoading || (interviewType === "dsa" && !topic)}
          className="focus-ring mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Preparing session..." : "Start interview"}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
