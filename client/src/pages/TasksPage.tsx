import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import type { AxiosError } from "axios";
import { getErrorMessage } from "../context/AuthContext";
import { TaskForm } from "../features/tasks/components/TaskForm";
import { TaskList } from "../features/tasks/components/TaskList";
import { LayoutList, Columns } from "lucide-react";
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

  const apiError =
    tasksQuery.error || createMut.error || updateMut.error || deleteMut.error;
  const errorMsg = apiError ? getErrorMessage(apiError as AxiosError) : null;

  const busy =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;

  function handleStatusChange(id: string, status: TaskStatus) {
    updateMut.mutate({ id, body: { status } });
  }

  function handleDelete(id: string) {
    deleteMut.mutate(id);
  }

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Task board
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Organize interview prep and daily work. Updates sync instantly for your
            account.
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 w-fit">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition ${view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <LayoutList className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition ${view === "board" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Columns className="h-4 w-4" />
            Board
          </button>
        </div>
      </div>

        {errorMsg ? (
          <div
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {errorMsg}
          </div>
        ) : null}

        {view === "list" ? (
          <div className="grid gap-8 lg:grid-cols-5">
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
                <div className="flex justify-center py-16">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                </div>
              ) : (
                <TaskList
                  tasks={tasksQuery.data ?? []}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  busy={busy}
                  view="list"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Task</h2>
              <TaskForm
                submitting={createMut.isPending}
                onSubmit={async (input) => {
                  await createMut.mutateAsync(input);
                }}
              />
            </div>
            
            {tasksQuery.isLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              </div>
            ) : (
              <TaskList
                tasks={tasksQuery.data ?? []}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                busy={busy}
                view="board"
              />
            )}
          </div>
        )}
    </AppLayout>
  );
}
