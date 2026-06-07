import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Missing or invalid Authorization header");
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new ApiError(401, "Missing token");
    }
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
      return;
    }
    next(new ApiError(401, "Invalid or expired token"));
  }
}
