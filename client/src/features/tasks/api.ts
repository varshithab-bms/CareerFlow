import { api } from "../../lib/api";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get<{ success: boolean; data: Task[] }>("/tasks");
  if (!data.success) throw new Error("Failed to load tasks");
  return data.data;
}

export async function createTask(body: CreateTaskInput): Promise<Task> {
  const { data } = await api.post<{ success: boolean; data: Task }>("/tasks", body);
  if (!data.success) throw new Error("Failed to create task");
  return data.data;
}

export async function updateTask(
  id: string,
  body: UpdateTaskInput,
): Promise<Task> {
  const { data } = await api.patch<{ success: boolean; data: Task }>(
    `/tasks/${id}`,
    body,
  );
  if (!data.success) throw new Error("Failed to update task");
  return data.data;
}

export async function deleteTask(id: string): Promise<void> {
  const { data } = await api.delete<{ success: boolean }>(`/tasks/${id}`);
  if (!data.success) throw new Error("Failed to delete task");
}
