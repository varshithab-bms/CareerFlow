import { useState, type FormEvent } from "react";
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
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
    >
      <h2 className="text-lg font-semibold text-slate-900">New task</h2>
      <p className="mt-1 text-sm text-slate-600">
        Capture what you need to do next. You can change status from the card.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="task-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finish system design notes"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand/30 focus:border-brand focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="task-description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context or links…"
            className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand/30 focus:border-brand focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="task-priority" className="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand/30 focus:border-brand focus:ring-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-due" className="mb-1 block text-sm font-medium text-slate-700">
            Due date <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand/30 focus:border-brand focus:ring-2"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add task"}
        </button>
      </div>
    </form>
  );
}
