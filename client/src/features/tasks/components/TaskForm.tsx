import { useState, type FormEvent } from "react";
import { CalendarDays, Plus, TextCursorInput } from "lucide-react";
import type { TaskPriority } from "../api";

interface TaskFormProps {
  onSubmit: (input: {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string | null;
  }) => Promise<void>;
  submitting?: boolean;
}

const priorities: Array<{ value: TaskPriority; label: string; className: string }> = [
  { value: "low", label: "Low", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "medium", label: "Medium", className: "border-amber-200 bg-amber-50 text-amber-700" },
  { value: "high", label: "High", className: "border-rose-200 bg-rose-50 text-rose-700" },
];

export function TaskForm({ onSubmit, submitting }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await onSubmit({
      title: trimmed,
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
  }

  return (
    <form onSubmit={handleSubmit} className="soft-panel p-5 sm:p-6">
      <div>
        <p className="text-sm font-semibold text-brand">New action item</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Capture next step</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Turn resume feedback, prep topics, and interview notes into a visible checklist.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="task-title" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <TextCursorInput className="h-4 w-4 text-brand" />
            Title
          </label>
          <input
            id="task-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Rewrite resume project bullet with metrics"
            className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand"
          />
        </div>

        <div>
          <label htmlFor="task-description" className="mb-2 block text-sm font-semibold text-slate-800">
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, links, or the feedback you are acting on..."
            className="focus-ring w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPriority(item.value)}
                  className={`focus-ring rounded-xl border px-3 py-2 text-sm font-bold transition ${
                    priority === item.value ? item.className : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="task-due" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CalendarDays className="h-4 w-4 text-brand" />
              Due date <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="focus-ring w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {submitting ? "Adding..." : "Add task"}
        </button>
      </div>
    </form>
  );
}
