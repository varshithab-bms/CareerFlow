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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">No tasks yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Create your first task using the form above.
        </p>
      </div>
    );
  }

  if (view === "board") {
    const todo = sortedTasks.filter(t => t.status === "todo");
    const inProgress = sortedTasks.filter(t => t.status === "in-progress");
    const done = sortedTasks.filter(t => t.status === "done");

    const Column = ({ title, colTasks }: { title: string, colTasks: Task[] }) => (
      <div className="flex flex-col gap-4 rounded-2xl bg-slate-50/50 p-4 border border-slate-200">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">{colTasks.length}</span>
        </div>
        <div className="flex flex-col gap-4">
          {colTasks.map(task => (
             <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              disabled={busy}
            />
          ))}
          {colTasks.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Empty</span>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <Column title="To Do" colTasks={todo} />
        <Column title="In Progress" colTasks={inProgress} />
        <Column title="Done" colTasks={done} />
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
