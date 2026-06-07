import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/authenticate.js";
import * as prepService from "./prep.service.js";

export async function generatePrepContent(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await prepService.generatePrepContent(req.body);
    res.status(200).json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
