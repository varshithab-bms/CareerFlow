import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "./api";

export const tasksQueryKey = ["tasks"] as const;

export function useTasksQuery() {
  return useQuery({
    queryKey: tasksQueryKey,
    queryFn: fetchTasks,
  });
}

export function useCreateTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });
}

export function useUpdateTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTaskInput }) =>
      updateTask(id, body),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });
}

export function useDeleteTaskMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });
}
