import { ClipboardList } from "lucide-react";
import type { Task, TaskStatus } from "../api";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  busy?: boolean;
  view?: "list" | "board";
}

export function TaskList({
  tasks,
  onStatusChange,
  onDelete,
  busy,
  view = "list",
}: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const aDate = a.dueDate ? new Date(a.dueDate) : null;
    const bDate = b.dueDate ? new Date(b.dueDate) : null;

    const aOverdue = aDate ? aDate < today && a.status !== "done" : false;
    const bOverdue = bDate ? bDate < today && b.status !== "done" : false;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const aPri = priorityWeight[a.priority] || 0;
    const bPri = priorityWeight[b.priority] || 0;

    return bPri - aPri;
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-slate-400" />
        <p className="mt-3 text-sm font-bold text-slate-700">No tasks yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Add one action item to start turning feedback into progress.
        </p>
      </div>
    );
  }

  if (view === "board") {
    const columns: Array<{ title: string; status: TaskStatus; tasks: Task[]; accent: string }> = [
      {
        title: "To do",
        status: "todo",
        tasks: sortedTasks.filter((task) => task.status === "todo"),
        accent: "bg-slate-500",
      },
      {
        title: "In progress",
        status: "in-progress",
        tasks: sortedTasks.filter((task) => task.status === "in-progress"),
        accent: "bg-blue-500",
      },
      {
        title: "Done",
        status: "done",
        tasks: sortedTasks.filter((task) => task.status === "done"),
        accent: "bg-emerald-500",
      },
    ];

    return (
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column.status} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${column.accent}`} />
                <h3 className="text-sm font-bold text-slate-800">{column.title}</h3>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                {column.tasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  disabled={busy}
                />
              ))}
              {column.tasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 py-8 text-center">
                  <span className="text-xs font-semibold text-slate-500">Nothing here yet</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {sortedTasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            disabled={busy}
          />
        </li>
      ))}
    </ul>
  );
}
