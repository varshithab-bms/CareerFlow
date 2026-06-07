import { api } from "../../lib/api";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  question: string;
  expectedKeyPoints?: string[];
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvement: string;
  verdict: string;
}

export interface Interview {
  id?: string;
  interviewId?: string;
  role: string;
  difficulty: Difficulty;
  questions?: Question[];
  currentQuestionIndex?: number;
  question?: Question;
  totalQuestions?: number;
  isComplete?: boolean;
  evaluation?: AnswerEvaluation;
  nextQuestion?: Question;
  finalScore?: number;
  [key: string]: any;
}

export async function startInterview(role: string, difficulty: Difficulty): Promise<Interview> {
  const { data } = await api.post<{ success: boolean; data: Interview }>("/interview/start", {
    role,
    difficulty,
  });
  return (data as any).success !== undefined ? data.data : (data as unknown as Interview);
}

export async function submitAnswer(interviewId: string, answer: string): Promise<Interview> {
  const { data } = await api.post<{ success: boolean; data: Interview }>(
    `/interview/${interviewId}/answer`,
    { answer }
  );
  return (data as any).success !== undefined ? data.data : (data as unknown as Interview);
}

export async function completeInterview(interviewId: string): Promise<Interview> {
  const { data } = await api.post<{ success: boolean; data: Interview }>(
    `/interview/${interviewId}/complete`
  );
  return (data as any).success !== undefined ? data.data : (data as unknown as Interview);
}

export async function getInterviewHistory(): Promise<Interview[]> {
  const { data } = await api.get<{ success: boolean; data: Interview[] }>("/interview/history");
  return (data as any).success !== undefined ? data.data : (data as unknown as Interview[]);
}

export async function getInterviewById(interviewId: string): Promise<Interview> {
  const { data } = await api.get<{ success: boolean; data: Interview }>(
    `/interview/${interviewId}`
  );
  return (data as any).success !== undefined ? data.data : (data as unknown as Interview);
}
