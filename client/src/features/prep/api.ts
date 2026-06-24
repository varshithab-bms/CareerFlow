import { api } from "../../lib/api";

export interface PrepVideoDto {
  title: string;
  url: string;
  channelTitle?: string;
  videoId?: string;
}

export interface PrepTopicDto {
  name: string;
  videos: PrepVideoDto[];
}

export interface PrepSessionDto {
  title: string;
  durationHint?: string;
  objectives?: string;
  topics: PrepTopicDto[];
  dsaTopics?: string[];
  aptitudeTopics?: string[];
}

export interface PrepGenerateResponse {
  jobRole: string;
  /** Backend engine id — rule-based templates (no OpenAI). */
  model: string;
  overviewMarkdown: string;
  sessions: PrepSessionDto[];
  youtubeConfigured: boolean;
}

export async function generatePrepPlan(jobRole: string): Promise<PrepGenerateResponse> {
  const { data } = await api.post<{
    success: boolean;
    data: PrepGenerateResponse;
  }>("/prep/generate", { jobRole });
  if (!data.success) throw new Error("Prep generation failed");
  return data.data;
}
