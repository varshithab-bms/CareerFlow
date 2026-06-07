import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/authenticate.js";
import * as taskService from "./task.service.js";

export async function createTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId!;
    const task = await taskService.createTask(userId, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function listTasks(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId!;
    const tasks = await taskService.listTasks(userId);
    res.status(200).json({ success: true, data: tasks });
  } catch (e) {
    next(e);
  }
}

export async function updateTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId!;
    const task = await taskService.updateTask(userId, req.params.id, req.body);
    res.status(200).json({ success: true, data: task });
  } catch (e) {
    next(e);
  }
}

export async function deleteTask(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId!;
    const result = await taskService.deleteTask(userId, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}
