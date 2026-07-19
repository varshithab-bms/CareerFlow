import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "../components/AppLayout";
import { SkeletonCard } from "../components/Skeleton";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileText,
  Mic2,
  Sparkles,
  Target,
} from "lucide-react";
import { getResumeHistory } from "../features/resume/api";
import { getInterviewHistory } from "../features/interview/api";
import { useTasksQuery } from "../features/tasks/hooks";
import {
  getAptitudeWeeklyStats,
  getDsaWeeklyCount,
  getWeeklyInterviewCount,
  loadWeeklyGoals,
  saveWeeklyGoals,
  type WeeklyGoals,
} from "../lib/weeklyProgress";

function refreshLocalWeeklyStats() {
  return {
    dsaCount: getDsaWeeklyCount(),
    aptitude: getAptitudeWeeklyStats(),
  };
}

export function DashboardPage() {
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoals>(loadWeeklyGoals);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const goalsRef = useRef<HTMLDivElement>(null);
  const [localWeeklyStats, setLocalWeeklyStats] = useState(refreshLocalWeeklyStats);

  useEffect(() => {
    saveWeeklyGoals(weeklyGoals);
  }, [weeklyGoals]);

  useEffect(() => {
    const refresh = () => setLocalWeeklyStats(refreshLocalWeeklyStats());
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!goalsOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!goalsRef.current?.contains(event.target as Node)) {
        setGoalsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [goalsOpen]);

  const resumesQuery = useQuery({
    queryKey: ["dashboard", "resume-history"],
    queryFn: getResumeHistory,
    retry: 1,
  });
  const interviewsQuery = useQuery({
    queryKey: ["dashboard", "interview-history"],
    queryFn: getInterviewHistory,
    retry: 1,
  });
  const tasksQuery = useTasksQuery();

  const resumes = resumesQuery.data ?? [];
  const interviews = interviewsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];

  const latestResume = [...resumes].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  )[0];
  const latestResumeScore =
    latestResume?.analysis?.atsScore ?? latestResume?.analysis?.baseAnalysis?.atsScore ?? null;

  const completedInterviews = interviews.filter(
    (interview) => interview.isComplete || interview.finalScore !== undefined,
  );
  const completedInterviewCount = completedInterviews.length;
  const scoredInterviews = completedInterviews.filter(
    (interview) => typeof interview.finalScore === "number",
  );
  const averageInterviewScore = scoredInterviews.length
    ? Math.round(
      scoredInterviews.reduce((total, interview) => total + (interview.finalScore ?? 0), 0) /
      scoredInterviews.length,
    )
    : null;
  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const taskCompletion = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : null;

  const weeklyInterviewCount = getWeeklyInterviewCount(interviews);
  const { dsaCount } = localWeeklyStats;
  const { count: aptitudeQuizCount, avgAccuracy: aptitudeAvgAccuracy } = localWeeklyStats.aptitude;

  const weeklyProgressStats = [
    {
      label: "DSA",
      value: `${dsaCount} problem${dsaCount === 1 ? "" : "s"} solved`,
      detail: `${dsaCount} of ${weeklyGoals.dsa} weekly goal`,
      current: dsaCount,
      goal: weeklyGoals.dsa,
    },
    {
      label: "Aptitude",
      value:
        aptitudeQuizCount === 0
          ? "0 quizzes completed"
          : `${aptitudeQuizCount} quiz${aptitudeQuizCount === 1 ? "" : "zes"} completed / ${aptitudeAvgAccuracy}% avg accuracy`,
      detail: `${aptitudeQuizCount} of ${weeklyGoals.aptitude} weekly goal`,
      current: aptitudeQuizCount,
      goal: weeklyGoals.aptitude,
    },
    {
      label: "Mock Interviews",
      value: `${weeklyInterviewCount} session${weeklyInterviewCount === 1 ? "" : "s"} completed`,
      detail: `${weeklyInterviewCount} of ${weeklyGoals.interviews} weekly goal`,
      current: weeklyInterviewCount,
      goal: weeklyGoals.interviews,
    },
  ];

  const prepStats = [
    {
      label: "Resume readiness",
      value: latestResumeScore === null ? "Not started" : `${latestResumeScore}%`,
      detail: latestResume ? latestResume.fileName || "Latest resume" : "Upload a resume to begin",
      tone:
        latestResumeScore === null
          ? "text-slate-500"
          : latestResumeScore >= 80
            ? "text-emerald-600"
            : latestResumeScore >= 60
              ? "text-amber-600"
              : "text-rose-600",
      width: `${latestResumeScore ?? 0}%`,
    },
    {
      label: "Mock interviews",
      value:
        averageInterviewScore === null
          ? completedInterviewCount
            ? `${completedInterviewCount} complete`
            : "Not started"
          : `${averageInterviewScore}% avg`,
      detail: interviews.length
        ? `${completedInterviewCount} completed of ${interviews.length} total session${interviews.length === 1 ? "" : "s"
        }`
        : "Start a mock interview",
      tone:
        averageInterviewScore === null
          ? completedInterviewCount
            ? "text-blue-600"
            : "text-slate-500"
          : averageInterviewScore >= 80
            ? "text-emerald-600"
            : averageInterviewScore >= 60
              ? "text-amber-600"
              : "text-rose-600",
      width: averageInterviewScore === null ? null : `${averageInterviewScore}%`,
    },
    {
      label: "Task completion",
      value: taskCompletion === null ? "No tasks" : `${taskCompletion}%`,
      detail: tasks.length ? `${doneTasks} of ${tasks.length} tasks done` : "Add your first action item",
      tone:
        taskCompletion === null
          ? "text-slate-500"
          : taskCompletion >= 80
            ? "text-emerald-600"
            : taskCompletion >= 40
              ? "text-amber-600"
              : "text-rose-600",
      width: `${taskCompletion ?? 0}%`,
    },
  ];

  const recommendedAction =
    latestResumeScore === null
      ? {
        title: "Analyze your resume",
        body: "Start with a resume scan so CareerFlow can surface role-specific gaps.",
        to: "/resume-enhancer",
        cta: "Upload resume",
        checks: ["Get ATS score", "Find missing keywords"],
      }
      : completedInterviewCount === 0
        ? {
          title: "Run your first mock interview",
          body: "Use your resume feedback to practice answers for your target role.",
          to: "/mock-interview",
          cta: "Start interview",
          checks: ["Practice one session", "Review answer feedback"],
        }
        : tasks.length === 0 || doneTasks < tasks.length
          ? {
            title: "Turn feedback into tasks",
            body: "Create concrete action items from resume and interview feedback.",
            to: "/tasks",
            cta: "Open tasks",
            checks: ["Prioritize weak spots", "Complete the next action"],
          }
          : {
            title: "Generate a prep roadmap",
            body: "Keep momentum with a role-specific prep plan and learning resources.",
            to: "/prep-sessions",
            cta: "Build plan",
            checks: ["Choose target role", "Review three sessions"],
          };

  const modules = [
    {
      to: "/resume-enhancer",
      eyebrow: "Profile",
      title: "Resume Analyzer",
      description: "Get ATS feedback, missing keywords, and stronger bullet rewrites.",
      icon: FileText,
      accent: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      to: "/mock-interview",
      eyebrow: "Practice",
      title: "Mock Interview",
      description: "Practice one question at a time with score-based coaching.",
      icon: Mic2,
      accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      to: "/prep-sessions",
      eyebrow: "Learn",
      title: "Prep Sessions",
      description: "Follow focused plans, videos, and structured study tasks.",
      icon: BookOpen,
      accent: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      to: "/dsa-practice",
      eyebrow: "DSA Practice",
      title: "Algorithms & Data Structures",
      description: "LeetCode problems by topic →",
      icon: Code2,
      accent: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    },
    {
      to: "/aptitude",
      eyebrow: "Aptitude",
      title: "Aptitude Practice",
      description: "Quant, Logic & Verbal →",
      icon: BrainCircuit,
      accent: "bg-rose-50 text-rose-700 border-rose-100",
    },
  ];

  const isLoading = resumesQuery.isLoading || interviewsQuery.isLoading || tasksQuery.isLoading;

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Interview prep workspace
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Your CareerFlow dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Progress is based on your resume analyses, mock interviews, and task completion.
          </p>
        </div>
        <Link
          to={recommendedAction.to}
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark sm:w-auto"
        >
          {recommendedAction.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="soft-panel mb-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Weekly targets</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Your readiness this week</h2>
          </div>
          <div className="relative" ref={goalsRef}>
            <button
              type="button"
              onClick={() => setGoalsOpen((open) => !open)}
              className="focus-ring rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              aria-label="Edit weekly goals"
              aria-expanded={goalsOpen}
            >
              Edit goals
            </button>
            {goalsOpen ? (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <p className="text-sm font-semibold text-slate-900">Weekly goals</p>
                <div className="mt-3 space-y-3">
                  {(
                    [
                      { key: "dsa" as const, label: "DSA problems" },
                      { key: "aptitude" as const, label: "Aptitude quizzes" },
                      { key: "interviews" as const, label: "Mock interviews" },
                    ] as const
                  ).map(({ key, label }) => (
                    <label key={key} className="block text-xs font-medium text-slate-600">
                      {label}
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={weeklyGoals[key]}
                        onChange={(event) => {
                          const parsed = parseInt(event.target.value, 10);
                          setWeeklyGoals((prev) => ({
                            ...prev,
                            [key]: Number.isFinite(parsed) && parsed > 0 ? parsed : prev[key],
                          }));
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {weeklyProgressStats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <div className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <span className="font-medium text-slate-700">{stat.label}</span>
                  <p className="mt-0.5 text-xs text-slate-500">{stat.detail}</p>
                </div>
                <span className="shrink-0 text-right text-xs font-bold text-amber-700">
                  {stat.current}/{stat.goal}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5" aria-label={stat.value}>
                {Array.from({ length: Math.min(stat.goal, 12) }, (_, index) => (
                  <span
                    key={index}
                    className={`h-2.5 flex-1 rounded-full transition-colors duration-500 ${
                      index < stat.current ? "bg-amber-500" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.25fr_0.85fr]">
        <section className="soft-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Progress dashboard</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Your preparation signals
              </h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 space-y-5">
            {prepStats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">{stat.label}</span>
                    <p className="mt-0.5 text-xs text-slate-500">{stat.detail}</p>
                  </div>
                  <span className={`shrink-0 font-bold ${stat.tone}`}>{stat.value}</span>
                </div>
                {stat.width ? (
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-700"
                      style={{ width: stat.width }}
                    />
                  </div>
                ) : (
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                    No score available yet
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="soft-panel p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-700">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Recommended now</p>
              <h2 className="text-lg font-bold text-slate-950">{recommendedAction.title}</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{recommendedAction.body}</p>
          <div className="mt-5 space-y-3 text-sm">
            {recommendedAction.checks.map((check, index) => (
              <div key={check} className="flex items-center gap-2 text-slate-700">
                {index === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ClipboardCheck className="h-4 w-4 text-blue-600" />
                )}
                {check}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {modules.map((module) => (
              <Link
                key={module.to}
                to={module.to}
                className="interactive-card group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card"
              >
                <div className={`inline-flex rounded-xl border p-2 ${module.accent}`}>
                  <module.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-sm font-semibold text-slate-500">{module.eyebrow}</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{module.title}</p>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                  {module.description}
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand">
                  Open module
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
            <Link
              to="/tasks"
              className="interactive-card group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card sm:col-span-2 lg:col-span-3 xl:col-span-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand">Task board</p>
                  <p className="mt-1 text-xl font-bold text-slate-950">
                    Turn feedback into action items
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Convert resume and interview notes into a focused prep checklist.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  Open board
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </>
        )}
      </div>
    </AppLayout>
  );
}
