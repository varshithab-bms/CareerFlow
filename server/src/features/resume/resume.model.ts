import mongoose, { Schema, Document } from "mongoose";

export interface ResumeAnalysis {
  baseAnalysis?: any;
  tailored?: any;
  jobDescription?: string;
}

export interface ResumeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  originalText: string;
  analysis?: ResumeAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<ResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    originalText: { type: String, required: true },

    analysis: {
      baseAnalysis: {
        type: Object,
        default: null,
      },
      tailored: {
        type: Object,
        default: null,
      },
      jobDescription: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model<ResumeDocument>("Resume", resumeSchema);