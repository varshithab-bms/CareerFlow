import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  Circle,
  ExternalLink,
  Flame,
  Lightbulb,
} from "lucide-react";
import { dsaProblems, dsaTopics } from "../data/dsaProblems";

type DoneState = {
  [problemId: string]: number;
};

export function DSAPracticePage() {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get("topic");
  
  const [selectedTopic, setSelectedTopic] = useState<string>(
    initialTopic && dsaTopics.includes(initialTopic) 
      ? initialTopic 
      : dsaTopics[2] ?? dsaTopics[0] ?? ""
  );
  const [doneState, setDoneState] = useState<DoneState>(() => {
    try {
      const stored = localStorage.getItem("cf_dsa_done");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse done state", e);
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("cf_dsa_done", JSON.stringify(doneState));
  }, [doneState]);

  const toggleProblem = (id: string) => {
    setDoneState((prev) => {
      const newState = { ...prev };
      if (newState[id]) {
        delete newState[id];
      } else {
        newState[id] = Date.now();
      }
      return newState;
    });
  };

  const getWeekStreak = () => {
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    return Object.values(doneState).filter((timestamp) => now - timestamp < oneWeekInMs).length;
  };

  const currentTopicProblems = dsaProblems.filter((p) => p.topic === selectedTopic);
  const currentTopicDoneCount = currentTopicProblems.filter((p) => doneState[p.id]).length;
  const currentTopicTotal = currentTopicProblems.length;
  const currentTopicProgress = currentTopicTotal === 0 ? 0 : Math.round((currentTopicDoneCount / currentTopicTotal) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Hard":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">DSA Practice Hub</h1>
              <p className="text-sm text-slate-500">Master Data Structures & Algorithms</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
            {getWeekStreak()} problems solved this week
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Sidebar - Topic Selector */}
          <aside className="w-full shrink-0 md:sticky md:top-24 md:w-64">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Topics</h2>
              </div>
              <div className="flex flex-col gap-1 p-2">
                {dsaTopics.map((topic) => {
                  const topicTotal = dsaProblems.filter((p) => p.topic === topic).length;
                  const topicDone = dsaProblems.filter((p) => p.topic === topic && doneState[p.id]).length;
                  const isSelected = selectedTopic === topic;
                  
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        isSelected
                          ? "bg-brand/10 text-brand"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{topic}</span>
                      <span
                        className={`text-xs ${
                          isSelected ? "text-brand" : "text-slate-400"
                        }`}
                      >
                        {topicDone}/{topicTotal}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content - Problem Grid */}
          <section className="flex-1 space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedTopic}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {currentTopicDoneCount} of {currentTopicTotal} solved
                </p>
              </div>
              <div className="w-32">
                <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Progress</span>
                  <span>{currentTopicProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${currentTopicProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {currentTopicProblems.map((problem) => {
                const isDone = !!doneState[problem.id];

                return (
                  <div
                    key={problem.id}
                    className={`flex flex-col rounded-xl border transition ${
                      isDone
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } p-5 shadow-sm`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-semibold ${
                              isDone ? "text-slate-600 line-through" : "text-slate-900"
                            }`}
                          >
                            {problem.title}
                          </h3>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${getDifficultyColor(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                          <span>{problem.hint}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <button
                        onClick={() => toggleProblem(problem.id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition ${
                          isDone
                            ? "text-emerald-600 hover:text-emerald-700"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Circle className="h-5 w-5" />
                            Mark as Done
                          </>
                        )}
                      </button>

                      <a
                        href={`https://leetcode.com/problems/${problem.leetcodeSlug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        Solve
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
