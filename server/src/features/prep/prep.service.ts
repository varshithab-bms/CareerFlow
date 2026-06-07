import { z } from "zod";
import { env } from "../../config/env.js";
import { getYoutubeResources } from "../../utils/youtube.js";
import {
  buildOverviewMarkdown,
  generateInterviewPlan,
  type InterviewPlanSession,
} from "./interviewPlan.generator.js";

const generateSchema = z.object({
  jobRole: z
    .string()
    .trim()
    .min(2, "Job role is too short")
    .max(120, "Job role is too long"),
});

export type PrepVideoDto = {
  title: string;
  url: string;
  channelTitle?: string;
  videoId?: string;
};

export type PrepTopicDto = {
  name: string;
  videos: PrepVideoDto[];
};

export type PrepSessionDto = {
  title: string;
  durationHint?: string;
  objectives?: string;
  topics: PrepTopicDto[];
};

export type PrepPlanDto = {
  jobRole: string;
  /** Engine identifier — rule-based only (no external LLM). */
  model: string;
  overviewMarkdown: string;
  sessions: PrepSessionDto[];
  youtubeConfigured: boolean;
};

async function enrichSessionsWithYoutube(
  role: string,
  sessions: InterviewPlanSession[],
): Promise<PrepSessionDto[]> {
  const ytKey = env.YOUTUBE_API_KEY;
  const maxPerTopic = env.YOUTUBE_VIDEOS_PER_TOPIC;
  const cache = new Map<string, PrepVideoDto[]>();

  async function videosForTopic(topicName: string): Promise<PrepVideoDto[]> {
    if (!ytKey) return [];
    const cacheKey = `${role}\0${topicName}`.toLowerCase();
    if (cache.has(cacheKey)) return cache.get(cacheKey)!;
    try {
      const vids = await getYoutubeResources(ytKey, topicName, role, maxPerTopic);
      cache.set(cacheKey, vids);
      return vids;
    } catch (e) {
      console.error("[prep] YouTube search failed:", topicName, e);
      cache.set(cacheKey, []);
      return [];
    }
  }

  const result: PrepSessionDto[] = [];

  for (const session of sessions) {
    const topics: PrepTopicDto[] = [];
    for (const topicName of session.topics) {
      const videos = await videosForTopic(topicName);
      topics.push({ name: topicName, videos });
    }
    result.push({
      title: session.title,
      durationHint: session.durationHint,
      objectives: session.objectives,
      topics,
    });
  }

  return result;
}

export async function generatePrepContent(body: unknown): Promise<PrepPlanDto> {
  const { jobRole } = generateSchema.parse(body);

  const plan = generateInterviewPlan(jobRole);
  const overviewMarkdown = buildOverviewMarkdown(plan.role, plan.matchedTemplate);
  const sessions = await enrichSessionsWithYoutube(plan.role, plan.sessions);

  return {
    jobRole: plan.role,
    model: "rule-based-v1",
    overviewMarkdown,
    sessions,
    youtubeConfigured: Boolean(env.YOUTUBE_API_KEY),
  };
}
