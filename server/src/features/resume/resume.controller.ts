import { Request, Response, NextFunction } from "express";
import * as resumeService from "./resume.service.js";

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new Error("Unauthorized");
    if (!req.file) throw new Error("No file uploaded");

    const result = await resumeService.uploadResume(req.userId, req.file);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function analyzeResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new Error("Unauthorized");

    const { resumeId, jobTitle } = req.body;
    if (!resumeId) throw new Error("resumeId required");
    if (!jobTitle) throw new Error("jobTitle required");

    const result = await resumeService.analyzeResume(req.userId, resumeId, jobTitle);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function tailorResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new Error("Unauthorized");

    const { resumeId, jobDescription } = req.body;
    if (!resumeId || !jobDescription) {
      throw new Error("resumeId and jobDescription required");
    }

    const result = await resumeService.tailorResume(
      req.userId,
      resumeId,
      jobDescription
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new Error("Unauthorized");

    const result = await resumeService.getResumeHistory(req.userId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new Error("Unauthorized");

    const { resumeId } = req.params;

    const result = await resumeService.getResumeById(req.userId, resumeId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
