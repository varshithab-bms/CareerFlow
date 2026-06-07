import { Resume } from "./resume.model.js";
import { extractText } from "./textExtractor.js";
import {
  analyzeResume as geminiAnalyzeResume,
  tailorResumeForJobDescription,
} from "../../services/geminiService.js";
import { ApiError } from "../../utils/ApiError.js";
import mongoose from "mongoose";

/* ---------------- UPLOAD ---------------- */
export async function uploadResume(userId: string, file: Express.Multer.File) {
  if (!file) throw new ApiError("No file provided", 400);

  const isPdf = file.mimetype === "application/pdf";
  const isDocx =
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (!isPdf && !isDocx) {
    throw new ApiError("File must be PDF or DOCX", 400);
  }

  const fileType = isPdf ? "pdf" : "docx";
  const extractedText = await extractText(file.buffer, fileType);

  const resume = await Resume.create({
    userId: new mongoose.Types.ObjectId(userId),
    fileName: file.originalname,
    originalText: extractedText,
    analysis: {},
  });

  return {
    id: resume._id.toString(),
    fileName: resume.fileName,
    text: extractedText,
  };
}

/* ---------------- ANALYZE ---------------- */
export async function analyzeResume(resumeId: string, jobTitle: string) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new ApiError("Resume not found", 404);

  if (!jobTitle) throw new ApiError("Job title is required for analysis", 400);

  const analysis = await geminiAnalyzeResume(resume.originalText, jobTitle);

  resume.analysis = {
    ...(resume.analysis || {}),
    baseAnalysis: analysis,
  };

  await resume.save();

  return {
    id: resume._id.toString(),
    fileName: resume.fileName,
    analysis: resume.analysis,
  };
}

/* ---------------- TAILOR ---------------- */
export async function tailorResume(resumeId: string, jobDescription: string) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new ApiError("Resume not found", 404);

  const safeJD = jobDescription.slice(0, 5000);

  const tailorResult = await tailorResumeForJobDescription(
    resume.originalText,
    safeJD
  );

  resume.analysis = {
    ...(resume.analysis || {}),
    tailored: tailorResult,
    jobDescription: safeJD,
  };

  await resume.save();

  return {
    id: resume._id.toString(),
    fileName: resume.fileName,
    analysis: resume.analysis,
  };
}

/* ---------------- HISTORY ---------------- */
export async function getResumeHistory(userId: string) {
  const resumes = await Resume.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .select("_id fileName analysis createdAt")
    .lean();

  return resumes.map((r: any) => ({
    id: r._id.toString(),
    fileName: r.fileName,
    atsScore: r.analysis?.baseAnalysis?.atsScore || 0,
    createdAt: r.createdAt,
  }));
}

/* ---------------- GET ONE ---------------- */
export async function getResumeById(resumeId: string) {
  const resume = await Resume.findById(resumeId).lean();
  if (!resume) throw new ApiError("Resume not found", 404);

  return {
    id: resume._id.toString(),
    fileName: resume.fileName,
    analysis: resume.analysis,
    createdAt: resume.createdAt,
  };
}