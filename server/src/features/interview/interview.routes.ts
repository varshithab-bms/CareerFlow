import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import * as interviewController from "./interview.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/start", interviewController.startInterview);
router.post("/:interviewId/answer", interviewController.submitAnswer);
router.post("/:interviewId/complete", interviewController.completeInterview);
router.get("/history", interviewController.getHistory);
router.get("/:interviewId", interviewController.getInterview);

export default router;
