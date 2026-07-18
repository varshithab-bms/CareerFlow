import { api, AI_REQUEST_TIMEOUT_MS } from "../../lib/api";

export interface ResumeAnalysis {
  atsScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  missingKeywords?: string[];
  rewrittenBullets?: { original: string; improved: string }[];
  projectFeedback?: string[];
  finalSuggestions?: string[];
  hiringImpression?: string;
  tailoredSuggestions?: string[];
  tailoredResume?: string;
  jobDescription?: string;
  [key: string]: any;
}

export interface Resume {
  id: string;
  fileName: string;
  text?: string;
  originalText?: string;
  analysis?: ResumeAnalysis;
  createdAt?: string;
}

export async function uploadResume(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<{ success: boolean; data: Resume }>(
    "/resume/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  // Assuming the backend might return data directly or wrapped in data
  return (data as any).success !== undefined ? data.data : (data as unknown as Resume);
}

export async function analyzeResume(resumeId: string, jobTitle: string): Promise<Resume> {
  const { data } = await api.post<{ success: boolean; data: Resume }>(
    "/resume/analyze",
    { resumeId, jobTitle },
    { timeout: AI_REQUEST_TIMEOUT_MS }
  );
  return (data as any).success !== undefined ? data.data : (data as unknown as Resume);
}

export async function tailorResume(
  resumeId: string,
  jobDescription: string
): Promise<Resume> {
  const { data } = await api.post<{ success: boolean; data: Resume }>(
    "/resume/tailor",
    { resumeId, jobDescription },
    { timeout: AI_REQUEST_TIMEOUT_MS }
  );
  return (data as any).success !== undefined ? data.data : (data as unknown as Resume);
}

export async function getResumeHistory(): Promise<Resume[]> {
  const { data } = await api.get<{ success: boolean; data: Resume[] }>("/resume/history");
  return (data as any).success !== undefined ? data.data : (data as unknown as Resume[]);
}

export async function getResumeById(resumeId: string): Promise<Resume> {
  const { data } = await api.get<{ success: boolean; data: Resume }>(
    `/resume/${resumeId}`
  );
  return (data as any).success !== undefined ? data.data : (data as unknown as Resume);
}
