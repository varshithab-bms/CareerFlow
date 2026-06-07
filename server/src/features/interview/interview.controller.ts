import { Request, Response, NextFunction } from "express";
import * as interviewService from "./interview.service.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function startInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { role, difficulty } = req.body;
    if (!role || !difficulty) {
      return res
        .status(400)
        .json({ error: "role and difficulty are required" });
    }

    const result = await interviewService.startInterview(
      req.userId,
      role,
      difficulty
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function submitAnswer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { interviewId } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ error: "answer is required" });
    }

    const result = await interviewService.submitAnswer(
      interviewId,
      req.userId,
      answer
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function completeInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { interviewId } = req.params;
    const result = await interviewService.completeInterview(
      interviewId,
      req.userId
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const history = await interviewService.getInterviewHistory(req.userId);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}

export async function getInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { interviewId } = req.params;
    const interview = await interviewService.getInterviewById(
      interviewId,
      req.userId
    );
    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
}