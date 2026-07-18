import { Request, Response, NextFunction } from "express";
import * as resumeService from "./resume.service.js";
import { ApiError } from "../../utils/ApiError.js";

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new ApiError("Unauthorized", 401);
    if (!req.file) throw new ApiError("No file uploaded", 400);

    const result = await resumeService.uploadResume(req.userId, req.file);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function analyzeResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new ApiError("Unauthorized", 401);

    const { resumeId, jobTitle } = req.body;
    if (!resumeId) throw new ApiError("resumeId required", 400);
    if (!jobTitle) throw new ApiError("jobTitle required", 400);

    const result = await resumeService.analyzeResume(req.userId, resumeId, jobTitle);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function tailorResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new ApiError("Unauthorized", 401);

    const { resumeId, jobDescription } = req.body;
    if (!resumeId || !jobDescription) {
      throw new ApiError("resumeId and jobDescription required", 400);
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
    if (!req.userId) throw new ApiError("Unauthorized", 401);

    const result = await resumeService.getResumeHistory(req.userId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.userId) throw new ApiError("Unauthorized", 401);

    const { resumeId } = req.params;

    const result = await resumeService.getResumeById(req.userId, resumeId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
