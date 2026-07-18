import { Request, Response, NextFunction } from "express";
import fs from "fs";
import * as interviewService from "./interview.service.js";
import { transcribeAudioFile } from "../../services/callAI.js";

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

    const { role, difficulty, type, topic } = req.body;
    if (!role || !difficulty) {
      return res
        .status(400)
        .json({ error: "role and difficulty are required" });
    }

    const result = await interviewService.startInterview(
      req.userId,
      role,
      difficulty,
      type || "technical",
      topic
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
  console.error("START INTERVIEW ERROR:");
  console.error(error);
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

export async function transcribeAudio(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const text = await transcribeAudioFile(req.file.path);

    // Clean up temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete temp audio file:", err);
    });

    res.status(200).json({ success: true, data: { text } });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
}