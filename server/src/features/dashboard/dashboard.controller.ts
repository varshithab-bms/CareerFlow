import type { Request, Response, NextFunction } from "express";
import * as dashboardService from "./dashboard.service.js";

export async function getInterviewPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const data = await dashboardService.getInterviewPerformance(req.userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
