import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const performanceCategories = ["fundamentals", "practical", "design", "DSA"] as const;
export type PerformanceCategory = (typeof performanceCategories)[number];

const interviewSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true,
    },
    date: { type: Date, required: true },
    totalQuestions: { type: Number, required: true, min: 0 },
    avgScore: { type: Number, required: true, min: 0, max: 100 },
    weakestCategory: {
      type: String,
      enum: performanceCategories,
      required: true,
    },
    categoryScores: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: false },
);

interviewSessionSchema.index({ userId: 1, date: -1 });

export type InterviewSessionDocument = InferSchemaType<typeof interviewSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const InterviewSession =
  mongoose.models.InterviewSession ??
  mongoose.model<InterviewSessionDocument>("InterviewSession", interviewSessionSchema);
