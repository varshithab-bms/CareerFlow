import mongoose, { Schema, Document } from "mongoose";

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
}

export interface InterviewAnswer {
  questionId: number;
  answer: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvement: string;
  verdict: string;
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvement: string;
  followUpQuestion: string;
  verdict: string;
}

export interface InterviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  difficulty: "easy" | "medium" | "hard";
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  totalScore: number;
  status: "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<InterviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    questions: [
      {
        id: Number,
        question: String,
        category: String,
      },
    ],
    answers: [
      {
        questionId: Number,
        answer: String,
        score: Number,
        strengths: [String],
        weaknesses: [String],
        improvement: String,
        verdict: String,
      },
    ],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

// Index for quick lookup by userId + creation date
interviewSchema.index({ userId: 1, createdAt: -1 });

export const Interview = mongoose.model<InterviewDocument>(
  "Interview",
  interviewSchema
);
