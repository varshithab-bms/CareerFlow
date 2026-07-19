import { Interview, InterviewAnswer } from "./interview.model.js";
import {
  InterviewSession,
  performanceCategories,
  type PerformanceCategory,
} from "./interviewSession.model.js";
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateDSAInterviewQuestion,
  evaluateDSAAnswer,
} from "../../services/geminiService.js";
import { ApiError } from "../../utils/ApiError.js";
import mongoose from "mongoose";

function getPerformanceCategory(interview: InstanceType<typeof Interview>, questionId: number): PerformanceCategory {
  if (interview.type === "dsa") return "DSA";

  const category = interview.questions.find((question) => question.id === questionId)?.category?.toLowerCase();
  if (category === "practical" || category === "design" || category === "fundamentals") return category;
  return "fundamentals";
}

async function persistSessionSummary(interview: InstanceType<typeof Interview>) {
  const categoryScores = new Map<PerformanceCategory, number[]>();
  for (const category of performanceCategories) categoryScores.set(category, []);

  for (const answer of interview.answers) {
    categoryScores.get(getPerformanceCategory(interview, answer.questionId))!.push(answer.score * 10);
  }

  const averages = Object.fromEntries(
    performanceCategories.flatMap((category) => {
      const scores = categoryScores.get(category)!;
      return scores.length ? [[category, Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)]] : [];
    }),
  ) as Partial<Record<PerformanceCategory, number>>;
  const answeredCategories = Object.entries(averages) as [PerformanceCategory, number][];
  const weakestCategory = answeredCategories.length
    ? answeredCategories.reduce((weakest, current) => current[1] < weakest[1] ? current : weakest)[0]
    : interview.type === "dsa" ? "DSA" : "fundamentals";
  const avgScore = interview.answers.length
    ? Math.round((interview.totalScore / interview.answers.length) * 10)
    : 0;

  await InterviewSession.findOneAndUpdate(
    { interviewId: interview._id },
    {
      $set: {
        userId: interview.userId,
        interviewId: interview._id,
        date: interview.updatedAt,
        totalQuestions: interview.questions.length,
        avgScore,
        weakestCategory,
        categoryScores: averages,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function startInterview(
  userId: string,
  role: string,
  difficulty: "easy" | "medium" | "hard",
  type: "behavioral" | "technical" | "dsa" = "technical",
  topic?: string
): Promise<any> {
  try {
    let questionsResponse;

    if (type === "dsa") {
      if (!topic) {
        throw new ApiError("Topic is required for DSA interviews", 400);
      }
      const dsaQuestion = await generateDSAInterviewQuestion(role, difficulty, topic);
      questionsResponse = {
        questions: [
          {
            id: 1,
            question: dsaQuestion.problemStatement,
            category: topic,
            problemTitle: dsaQuestion.problemTitle,
            topic: dsaQuestion.topic,
            constraints: dsaQuestion.constraints,
            examples: dsaQuestion.examples,
            approachHint: dsaQuestion.approachHint,
            evaluationCriteria: dsaQuestion.evaluationCriteria,
          },
        ],
      };
    } else {
      questionsResponse = await generateInterviewQuestions(role, difficulty);
    }

    const interview = new Interview({
      userId: new mongoose.Types.ObjectId(userId),
      role,
      type,
      difficulty,
      topic,
      questions: questionsResponse.questions || [],
      answers: [],
      currentQuestionIndex: 0,
      totalScore: 0,
      status: "in-progress",
    });

    await interview.save();

    const currentQuestion =
      interview.questions[interview.currentQuestionIndex];

    return {
      interviewId: interview._id.toString(),
      role: interview.role,
      type: interview.type,
      topic: interview.topic,
      difficulty: interview.difficulty,
      totalQuestions: interview.questions.length,
      currentQuestionIndex: interview.currentQuestionIndex,
      question: currentQuestion,
    };
  } catch (error) {
  console.error("SERVICE ERROR:");
  console.error(error);

  throw new ApiError(
    `Failed to start interview: ${
      error instanceof Error ? error.message : String(error)
    }`,
    500
  );
}
}

export async function submitAnswer(
  interviewId: string,
  userId: string,
  answer: string
): Promise<any> {
  try {
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!interview) {
      throw new ApiError("Interview not found", 404);
    }

    if (interview.status !== "in-progress") {
      throw new ApiError("Interview is not in progress", 400);
    }

    const currentQuestion = interview.questions[interview.currentQuestionIndex];
    if (!currentQuestion) {
      throw new ApiError("No current question found", 400);
    }

    let evaluation;

    if (interview.type === "dsa") {
      evaluation = await evaluateDSAAnswer(
        currentQuestion.question,
        answer,
        interview.role,
        interview.topic || "",
        interview.difficulty
      );
    } else {
      evaluation = await evaluateInterviewAnswer(
        currentQuestion.question,
        answer,
        interview.role
      );
    }

    // Save answer
    const answerRecord: InterviewAnswer = {
      questionId: currentQuestion.id,
      answer,
      score: evaluation.overallScore ? evaluation.overallScore / 10 : evaluation.score,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      improvement: evaluation.suggestions ? evaluation.suggestions.join(" ") : (evaluation.improvement || ""),
      verdict: evaluation.codeQuality || evaluation.verdict || "",
    };

    interview.answers.push(answerRecord);
    // evaluation.score is 0-10; accumulate raw then compute avg at end
    interview.totalScore += answerRecord.score;

    // Move to next question if available
    const hasNextQuestion =
      interview.currentQuestionIndex < interview.questions.length - 1;

    if (hasNextQuestion) {
      interview.currentQuestionIndex += 1;
    } else {
      interview.status = "completed";
    }

    await interview.save();
    if (interview.status === "completed") await persistSessionSummary(interview);

    const nextQuestion = hasNextQuestion
      ? interview.questions[interview.currentQuestionIndex]
      : null;

    const evaluationResponse = interview.type === "dsa"
      ? {
          overallScore: evaluation.overallScore,
          correctness: evaluation.correctness,
          timeComplexity: evaluation.timeComplexity,
          spaceComplexity: evaluation.spaceComplexity,
          edgeCasesCovered: evaluation.edgeCasesCovered,
          codeQuality: evaluation.codeQuality,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          suggestions: evaluation.suggestions,
        }
      : {
          score: evaluation.score,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses,
          improvement: evaluation.improvement,
          verdict: evaluation.verdict,
        };

    return {
      interviewId: interview._id.toString(),
      evaluation: evaluationResponse,
      nextQuestion: nextQuestion || null,
      isComplete: interview.status === "completed",
      questionsAnswered: interview.answers.length,
      totalQuestions: interview.questions.length,
      currentScore: Math.round((interview.totalScore / interview.answers.length) * 10),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      `Failed to submit answer: ${error instanceof Error ? error.message : String(error)}`,
      500
    );
  }
}

export async function completeInterview(
  interviewId: string,
  userId: string
): Promise<any> {
  try {
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!interview) {
      throw new ApiError("Interview not found", 404);
    }

    interview.status = "completed";
    await interview.save();
    await persistSessionSummary(interview);

    // Compute final score: average of per-answer scores (0-10 each) * 10 → 0-100
    const avgScore = interview.answers.length > 0
      ? interview.answers.reduce((sum, a) => sum + a.score, 0) / interview.answers.length
      : 0;
    const finalScore = Math.round(avgScore * 10);

    return {
      interviewId: interview._id.toString(),
      role: interview.role,
      difficulty: interview.difficulty,
      finalScore,
      questionsAsked: interview.questions.length,
      answersGiven: interview.answers.length,
      answers: interview.answers,
      questions: interview.questions,
      completedAt: interview.updatedAt,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      `Failed to complete interview: ${error instanceof Error ? error.message : String(error)}`,
      500
    );
  }
}

export async function getInterviewHistory(userId: string): Promise<any[]> {
  try {
    const interviews = await Interview.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .select("_id role difficulty totalScore status createdAt")
      .lean();

    return interviews.map((interview: any) => ({
      id: interview._id.toString(),
      role: interview.role,
      difficulty: interview.difficulty,
      score: Math.round(interview.totalScore),
      status: interview.status,
      createdAt: interview.createdAt,
    }));
  } catch (error) {
    throw new ApiError(
      `Failed to fetch interview history: ${error instanceof Error ? error.message : String(error)}`,
      500
    );
  }
}

export async function getInterviewById(
  interviewId: string,
  userId: string
): Promise<any> {
  try {
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!interview) {
      throw new ApiError("Interview not found", 404);
    }

    return {
      id: interview._id.toString(),
      role: interview.role,
      difficulty: interview.difficulty,
      questions: interview.questions,
      answers: interview.answers,
      totalScore: Math.round(interview.totalScore),
      status: interview.status,
      createdAt: interview.createdAt,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      `Failed to fetch interview: ${error instanceof Error ? error.message : String(error)}`,
      500
    );
  }
}
