import { Calendar, CheckCircle2, Clock3, Trash2 } from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "../api";

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  medium: "bg-amber-50 text-amber-700 ring-amber-100",
  high: "bg-rose-50 text-rose-700 ring-rose-100",
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function TaskCard({ task, onStatusChange, onDelete, disabled }: TaskCardProps) {
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = dueDateObj ? dueDateObj < today && task.status !== "done" : false;
  const isDone = task.status === "done";

  const due = dueDateObj
    ? dueDateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <article className={`interactive-card rounded-2xl border bg-white p-5 shadow-card ${isDone ? "border-emerald-100" : "border-slate-200/90"}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`break-words text-base font-bold ${isDone ? "text-slate-500 line-through" : "text-slate-950"}`}>
                {task.title}
              </h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${priorityStyles[task.priority]}`}>
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {task.description}
              </p>
            )}
          </div>
          {isDone && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {due ? (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${isOverdue ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                <Calendar className="h-3.5 w-3.5" />
                {isOverdue ? `Overdue ${due}` : due}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                <Clock3 className="h-3.5 w-3.5" />
                No due date
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label className="sr-only" htmlFor={`status-${task.id}`}>
              Status
            </label>
            <select
              id={`status-${task.id}`}
              value={task.status}
              disabled={disabled}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
              className="focus-ring rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
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
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
