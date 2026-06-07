import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { uploadMiddleware } from "../../middleware/uploadHandler.js";
import * as resumeController from "./resume.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/upload", uploadMiddleware.single("file"), resumeController.uploadFile);
router.post("/analyze", resumeController.analyzeResume);
router.post("/tailor", resumeController.tailorResume);
router.get("/history", resumeController.getHistory);
router.get("/:resumeId", resumeController.getResume);

export default router;
