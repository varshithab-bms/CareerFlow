import mongoose from "mongoose";
import {
  InterviewSession,
  performanceCategories,
  type PerformanceCategory,
} from "../interview/interviewSession.model.js";

export async function getInterviewPerformance(userId: string) {
  const sessions = await InterviewSession.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  const chronologicalSessions = sessions.reverse();
  const categoryTotals = new Map<PerformanceCategory, { total: number; count: number }>();

  for (const category of performanceCategories) {
    categoryTotals.set(category, { total: 0, count: 0 });
  }

  for (const session of chronologicalSessions) {
    for (const [category, score] of Object.entries(session.categoryScores ?? {})) {
      if (!performanceCategories.includes(category as PerformanceCategory) || typeof score !== "number") continue;
      const total = categoryTotals.get(category as PerformanceCategory)!;
      total.total += score;
      total.count += 1;
    }
  }

  return {
    sessions: chronologicalSessions.map((session) => ({
      date: session.date,
      totalQuestions: session.totalQuestions,
      avgScore: session.avgScore,
      weakestCategory: session.weakestCategory,
    })),
    categories: performanceCategories.map((category) => {
      const total = categoryTotals.get(category)!;
      return {
        category,
        avgScore: total.count ? Math.round(total.total / total.count) : null,
        sessions: total.count,
      };
    }),
  };
}
