import { Interview, InterviewAnswer } from "./interview.model.js";
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} from "../../services/geminiService.js";
import { ApiError } from "../../utils/ApiError.js";
import mongoose from "mongoose";

export async function startInterview(
  userId: string,
  role: string,
  difficulty: "easy" | "medium" | "hard"
): Promise<any> {
  try {
    const questionsResponse = await generateInterviewQuestions(role, difficulty);

    const interview = new Interview({
      userId: new mongoose.Types.ObjectId(userId),
      role,
      difficulty,
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
      difficulty: interview.difficulty,
      totalQuestions: interview.questions.length,
      currentQuestionIndex: interview.currentQuestionIndex,
      question: currentQuestion,
    };
  } catch (error) {
    throw new ApiError(
      `Failed to start interview: ${error instanceof Error ? error.message : String(error)}`,
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

    // Evaluate answer with Gemini
    const evaluation = await evaluateInterviewAnswer(
      currentQuestion.question,
      answer,
      interview.role
    );

    // Save answer
    const answerRecord: InterviewAnswer = {
      questionId: currentQuestion.id,
      answer,
      score: evaluation.score,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      improvement: evaluation.improvement || "",
      verdict: evaluation.verdict || "",
    };

    interview.answers.push(answerRecord);
    // evaluation.score is 0-10; accumulate raw then compute avg at end
    interview.totalScore += evaluation.score;

    // Move to next question if available
    const hasNextQuestion =
      interview.currentQuestionIndex < interview.questions.length - 1;

    if (hasNextQuestion) {
      interview.currentQuestionIndex += 1;
    } else {
      interview.status = "completed";
    }

    await interview.save();

    const nextQuestion = hasNextQuestion
      ? interview.questions[interview.currentQuestionIndex]
      : null;

    return {
      interviewId: interview._id.toString(),
      evaluation: {
        score: evaluation.score,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        improvement: evaluation.improvement,
        verdict: evaluation.verdict,
      },
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