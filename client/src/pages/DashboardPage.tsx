import { Link } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { useState, useEffect } from "react";
import { SkeletonCard } from "../components/Skeleton";

export function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <AppLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Your AI interview prep and productivity hub. Manage tasks, stay focused,
          and track what matters next.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Link
              to="/prep-sessions"
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:border-slate-300 hover:shadow-md"
            >
              <p className="text-sm font-medium text-slate-500">Focus</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Prep sessions</p>
              <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700">
                AI prep + videos →
              </p>
            </Link>
            <Link
              to="/resume-enhancer"
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:border-slate-300 hover:shadow-md"
            >
              <p className="text-sm font-medium text-slate-500">Profile</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Resume enhancer</p>
              <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700">
                Analyze resume →
              </p>
            </Link>
            <Link
              to="/mock-interview"
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:border-slate-300 hover:shadow-md"
            >
              <p className="text-sm font-medium text-slate-500">Practice</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Mock interview</p>
              <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700">
                Start practicing →
              </p>
            </Link>
            <Link
              to="/applications"
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition hover:border-slate-300 hover:shadow-md"
            >
              <p className="text-sm font-medium text-slate-500">Pipeline</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Applications</p>
              <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-700">
                Coming soon →
              </p>
            </Link>
            <Link
              to="/tasks"
              className="group rounded-2xl border border-brand/20 bg-brand-soft p-6 shadow-card transition hover:border-brand/40 sm:col-span-2 lg:col-span-1"
            >
              <p className="text-sm font-medium text-brand">Tasks</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Open board</p>
              <p className="mt-1 text-xs text-slate-600 group-hover:text-slate-800">
                Create and manage your task list →
              </p>
            </Link>
          </>
        )}
      </div>
    </AppLayout>
  );
}
