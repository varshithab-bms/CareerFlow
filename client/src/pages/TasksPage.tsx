import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { Columns, LayoutList, Loader2, Target, Timer, Trophy } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { getErrorMessage } from "../context/AuthContext";
import { TaskForm } from "../features/tasks/components/TaskForm";
import { TaskList } from "../features/tasks/components/TaskList";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useTasksQuery,
  useUpdateTaskMutation,
} from "../features/tasks/hooks";
import type { TaskStatus } from "../features/tasks/api";

export function TasksPage() {
  const [view, setView] = useState<"list" | "board">(() => {
    return (localStorage.getItem("careerflow_task_view") as "list" | "board") || "list";
  });

  useEffect(() => {
    localStorage.setItem("careerflow_task_view", view);
  }, [view]);

  const tasksQuery = useTasksQuery();
  const createMut = useCreateTaskMutation();
  const updateMut = useUpdateTaskMutation();
  const deleteMut = useDeleteTaskMutation();

  const tasks = tasksQuery.data ?? [];
  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.status === "done").length;
    const inProgress = tasks.filter((task) => task.status === "in-progress").length;
    const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return { done, inProgress, total: tasks.length, completion };
  }, [tasks]);

  const apiError = tasksQuery.error || createMut.error || updateMut.error || deleteMut.error;
  const errorMsg = apiError ? getErrorMessage(apiError as AxiosError) : null;
  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  function handleStatusChange(id: string, status: TaskStatus) {
    updateMut.mutate({ id, body: { status } });
  }

  function handleDelete(id: string) {
    deleteMut.mutate(id);
  }

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">Task Board</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Convert feedback into steady progress.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Organize resume fixes, practice topics, and interview follow-ups in one place.
          </p>
        </div>

        <div className="flex w-fit rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setView("list")}
            className={`focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
              view === "list" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LayoutList className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setView("board")}
            className={`focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${
              view === "board" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Columns className="h-4 w-4" />
            Board
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Metric icon={Target} label="Total tasks" value={String(stats.total)} />
        <Metric icon={Timer} label="In progress" value={String(stats.inProgress)} />
        <Metric icon={Trophy} label="Complete" value={`${stats.completion}%`} />
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800" role="alert">
          {errorMsg}
        </div>
      )}

      {view === "list" ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <TaskForm
              submitting={createMut.isPending}
              onSubmit={async (input) => {
                await createMut.mutateAsync(input);
              }}
            />
          </div>
          <div className="lg:col-span-3">
            {tasksQuery.isLoading ? (
              <LoadingTasks />
            ) : (
              <TaskList tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} busy={busy} view="list" />
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <TaskForm
            submitting={createMut.isPending}
            onSubmit={async (input) => {
              await createMut.mutateAsync(input);
            }}
          />

          {tasksQuery.isLoading ? (
            <LoadingTasks />
          ) : (
            <TaskList tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDelete} busy={busy} view="board" />
          )}
        </div>
      )}
    </AppLayout>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="soft-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-brand">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function LoadingTasks() {
  return (
    <div className="soft-panel flex items-center justify-center gap-3 py-16">
      <Loader2 className="h-6 w-6 animate-spin text-brand" />
      <span className="text-sm font-semibold text-slate-600">Loading tasks</span>
    </div>
  );
}
