import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { authenticate } from "../../middleware/authenticate.js";
import * as interviewController from "./interview.controller.js";

const router = express.Router();
const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".webm";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(authenticate);

router.post("/start", interviewController.startInterview);
router.post("/transcribe", upload.single("audio"), interviewController.transcribeAudio);
router.post("/:interviewId/answer", interviewController.submitAnswer);
router.post("/:interviewId/complete", interviewController.completeInterview);
router.get("/history", interviewController.getHistory);
router.get("/:interviewId", interviewController.getInterview);

export default router;
