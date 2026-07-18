import { api, AI_REQUEST_TIMEOUT_MS } from "../../lib/api";

export type Difficulty = "easy" | "medium" | "hard";
export type InterviewType = "behavioral" | "technical" | "dsa";

export type DSATopic =
  | "Arrays"
  | "Strings"
  | "Linked Lists"
  | "Stacks"
  | "Queues"
  | "Hash Tables"
  | "Trees"
  | "Binary Search Trees"
  | "Heaps"
  | "Graphs"
  | "Recursion"
  | "Backtracking"
  | "Dynamic Programming"
  | "Greedy"
  | "Sliding Window"
  | "Two Pointers"
  | "Sorting & Searching";

export interface Question {
  id: string;
  question: string;
  expectedKeyPoints?: string[];
  category?: string;
  problemTitle?: string;
  topic?: string;
  constraints?: string;
  examples?: string[];
  approachHint?: string;
  evaluationCriteria?: string;
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvement: string;
  verdict: string;
}

export interface DSAEvaluation {
  overallScore: number;
  correctness: number;
  timeComplexity: string;
  spaceComplexity: string;
  edgeCasesCovered: boolean;
  codeQuality: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface Interview {
  id?: string;
  interviewId?: string;
  role: string;
  type?: InterviewType;
  topic?: string;
  difficulty: Difficulty;
  questions?: Question[];
  currentQuestionIndex?: number;
  question?: Question;
  totalQuestions?: number;
  isComplete?: boolean;
  evaluation?: AnswerEvaluation | DSAEvaluation;
  nextQuestion?: Question;
  finalScore?: number;
  [key: string]: any;
}

export async function startInterview(
  role: string,
  difficulty: Difficulty,
  type?: InterviewType,
  topic?: DSATopic
): Promise<Interview> {
  const { data } = await api.post<{ success: boolean; data: Interview }>(
    "/interview/start",
    {
      role,
      difficulty,
      type,
      topic,
    },
    { timeout: AI_REQUEST_TIMEOUT_MS }
  );
  return (data as any).success !== undefined ? data.data : (data as unknown as Interview);
}

export async function submitAnswer(interviewId: string, answer: string): Promise<Interview> {
  const { data } = await api.post<{ success: boolean; data: Interview }>(
    `/interview/${interviewId}/answer`,
    { answer },
    { timeout: AI_REQUEST_TIMEOUT_MS }
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

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  
  const { data } = await api.post<{ success: boolean; data: { text: string } }>(
    "/interview/transcribe",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: AI_REQUEST_TIMEOUT_MS,
    }
  );

  const payload =
    (data as { success?: boolean; data?: { text?: string } }).success !== undefined
      ? data.data
      : (data as unknown as { text?: string });

  return payload?.text?.trim() ?? "";
}
