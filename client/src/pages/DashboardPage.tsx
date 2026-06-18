import { Link } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { useEffect, useState } from "react";
import { SkeletonCard } from "../components/Skeleton";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Mic2,
  Sparkles,
  Target,
} from "lucide-react";

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const prepStats = [
    { label: "Resume readiness", value: "78%", tone: "text-emerald-600", width: "78%" },
    { label: "Interview practice", value: "4/8", tone: "text-blue-600", width: "50%" },
    { label: "Weekly focus", value: "62%", tone: "text-amber-600", width: "62%" },
  ];

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
  ];

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Interview prep workspace
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Your next best step is ready.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Move between resume feedback, focused practice, and interview coaching
            without losing track of progress.
          </p>
        </div>
        <Link
          to="/mock-interview"
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark sm:w-auto"
        >
          Start practice
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="soft-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Progress dashboard</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Weekly preparation health
              </h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 space-y-5">
            {prepStats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{stat.label}</span>
                  <span className={`font-bold ${stat.tone}`}>{stat.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-700"
                    style={{ width: stat.width }}
                  />
                </div>
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
              <h2 className="text-lg font-bold text-slate-950">Practice weak areas</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Run a medium mock interview, then use the feedback to refine two resume
            bullets with measurable outcomes.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Review latest resume score
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              Complete one interview session
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
              className="interactive-card group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card md:col-span-3"
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
