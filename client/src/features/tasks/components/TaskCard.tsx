import type { Task, TaskPriority, TaskStatus } from "../api";
import { Calendar } from "lucide-react";

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

const priorityDot: Record<TaskPriority, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function TaskCard({
  task,
  onStatusChange,
  onDelete,
  disabled,
}: TaskCardProps) {
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  // Strip time for overdue check
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isOverdue = dueDateObj ? dueDateObj < today && task.status !== "done" : false;

  const due = dueDateObj
    ? dueDateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className="flex flex-col rounded-xl border border-slate-200/90 bg-white p-5 shadow-card transition hover:border-slate-300/90">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {task.title}
            </h3>
            <div 
              className={`h-2.5 w-2.5 rounded-full ${priorityDot[task.priority]}`} 
              title={`${task.priority} priority`} 
            />
          </div>
          {task.description ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
              {task.description}
            </p>
          ) : null}
          {due ? (
            <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${isOverdue ? "text-rose-600 font-semibold" : "text-slate-500"}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span>{due}</span>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor={`status-${task.id}`}>
            Status
          </label>
          <select
            id={`status-${task.id}`}
            value={task.status}
            disabled={disabled}
            onChange={(e) =>
              onStatusChange(task.id, e.target.value as TaskStatus)
            }
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-800 outline-none ring-brand/30 focus:border-brand focus:ring-2 disabled:opacity-50"
          >
            {(Object.keys(statusLabels) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (window.confirm("Delete this task?")) onDelete(task.id);
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
