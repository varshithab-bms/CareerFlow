import { z } from "zod";
import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { Task, TaskPriorities, TaskStatuses } from "./task.model.js";

const createSchema = z.object({
  title: z.string().min(1).trim(),
  description: z.string().trim().optional(),
  status: z.enum(TaskStatuses).optional(),
  priority: z.enum(TaskPriorities).optional(),
  dueDate: z.coerce.date().optional().nullable(),
});

const updateSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().trim().optional().nullable(),
  status: z.enum(TaskStatuses).optional(),
  priority: z.enum(TaskPriorities).optional(),
  dueDate: z.coerce.date().optional().nullable(),
});

function toDto(doc: {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? undefined,
    status: doc.status as (typeof TaskStatuses)[number],
    priority: doc.priority as (typeof TaskPriorities)[number],
    dueDate: doc.dueDate ? doc.dueDate.toISOString() : undefined,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function createTask(userId: string, body: unknown) {
  const data = createSchema.parse(body);
  const task = await Task.create({
    title: data.title,
    description: data.description,
    status: data.status ?? "todo",
    priority: data.priority ?? "medium",
    dueDate: data.dueDate ?? undefined,
    userId: new mongoose.Types.ObjectId(userId),
  });
  return toDto(task);
}

export async function listTasks(userId: string) {
  const tasks = await Task.find({ userId })
    .sort({ dueDate: 1, createdAt: -1 })
    .lean()
    .exec();
  return tasks.map((t) => {
    const doc = t as unknown as {
      _id: mongoose.Types.ObjectId;
      title: string;
      description?: string | null;
      status: string;
      priority: string;
      dueDate?: Date | null;
      createdAt?: Date;
      updatedAt?: Date;
    };
    return toDto(doc);
  });
}

export async function updateTask(userId: string, taskId: string, body: unknown) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }
  const data = updateSchema.parse(body);
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description ?? "";
  if (data.status !== undefined) update.status = data.status;
  if (data.priority !== undefined) update.priority = data.priority;
  if (data.dueDate !== undefined) {
    update.dueDate = data.dueDate ?? null;
  }
  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  return toDto(task);
}

export async function deleteTask(userId: string, taskId: string) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task id");
  }
  const result = await Task.deleteOne({ _id: taskId, userId });
  if (result.deletedCount === 0) {
    throw new ApiError(404, "Task not found");
  }
  return { deleted: true };
}
