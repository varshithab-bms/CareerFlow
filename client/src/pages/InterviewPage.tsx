import { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { InterviewSetup } from "../features/interview/components/InterviewSetup";
import { ActiveSession } from "../features/interview/components/ActiveSession";
import { InterviewResults } from "../features/interview/components/InterviewResults";
import {
  startInterview,
  submitAnswer,
  completeInterview,
  type Interview,
  type Difficulty,
} from "../features/interview/api";
import { useToast } from "../context/ToastContext";

export function InterviewPage() {
  const { showToast } = useToast();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async (role: string, difficulty: Difficulty) => {
    try {
      setIsLoading(true);
      const data = await startInterview(role, difficulty);
      setInterview(data);
      showToast("Interview started successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to start interview. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (answer: string) => {
    if (!interview?.interviewId) return;
    try {
      setIsLoading(true);
      const data = await submitAnswer(interview.interviewId, answer);
      // Data returns updated interview state with evaluation and potentially nextQuestion
      setInterview((prev) => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error(error);
      showToast("Failed to submit answer.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!interview) return;
    if (interview.isComplete || !interview.nextQuestion) {
      // If complete or no next question, fetch final results
      try {
        setIsLoading(true);
        const data = await completeInterview(interview.interviewId as string);
        setInterview((prev) => prev ? { ...prev, ...data, isComplete: true, evaluation: undefined } : null);
        showToast("Interview completed", "success");
      } catch (error) {
        console.error(error);
        showToast("Failed to complete interview.", "error");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Move to next question state
      setInterview({
        ...interview,
        question: interview.nextQuestion,
        evaluation: undefined,
        currentQuestionIndex: (interview.currentQuestionIndex ?? 0) + 1,
      });
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="text-sm font-semibold text-brand">Mock Interview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Practice answers with structured feedback.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Move through each question with a focused workspace, session controls,
          and feedback you can use immediately.
        </p>
      </div>
        {!interview ? (
          <>
            <InterviewSetup onStart={handleStart} isLoading={isLoading} />
          </>
        ) : interview.isComplete && interview.finalScore !== undefined ? (
          <InterviewResults interview={interview} onRetake={() => setInterview(null)} />
        ) : interview.question ? (
          <ActiveSession
            question={interview.question}
            questionNumber={(interview.currentQuestionIndex ?? 0) + 1}
            totalQuestions={interview.totalQuestions ?? 5}
            onSubmitAnswer={handleSubmitAnswer}
            isSubmitting={isLoading}
            lastEvaluation={interview.evaluation}
            onNextQuestion={handleNextQuestion}
            isComplete={interview.isComplete}
            onRetake={() => setInterview(null)}
          />
        ) : null}
    </AppLayout>
  );
}
