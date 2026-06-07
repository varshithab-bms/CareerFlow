import { Link } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";

function ComingSoonLayout({
  title,
  description,
  plannedBullets,
}: {
  title: string;
  description: string;
  plannedBullets?: string[];
}) {

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">
          Coming soon
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-4 text-slate-600">{description}</p>

        {plannedBullets && plannedBullets.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <p className="text-sm font-semibold text-slate-800">Planned capabilities</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              {plannedBullets.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
          <p className="text-sm text-slate-500">
            This module will connect to the API in a future release. Tasks and Prep
            sessions are available today.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/tasks"
              className="inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Go to tasks
            </Link>
            <Link
              to="/prep-sessions"
              className="inline-flex rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Prep sessions
            </Link>
          </div>
        </div>
        <p className="mt-8">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-brand hover:underline"
          >
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </AppLayout>
  );
}

export function ApplicationsPage() {
  return (
    <ComingSoonLayout
      title="Applications"
      description="Track roles, stages, contacts, and deadlines across your job search. This tracker is planned; use Tasks for checklists until we ship it."
      plannedBullets={[
        "Kanban or table view by company and stage",
        "Deadlines and follow-up reminders",
        "Notes per application and contact",
      ]}
    />
  );
}
