import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env.js";
import { generateContentWithRetry } from "../../services/geminiRetry.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
export type RoleTemplateId = "ai-generated";

export interface InterviewPlanSession {
  title: string;
  topics: string[];
  durationHint: string;
  objectives: string;
}

export interface InterviewPlan {
  role: string;
  matchedTemplate: RoleTemplateId;
  sessions: InterviewPlanSession[];
}
export async function generateInterviewPlan(
  roleInput: string,
): Promise<InterviewPlan> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
Generate a professional interview preparation roadmap for ${roleInput}.

Return ONLY valid JSON.

Schema:

{
  "sessions": [
    {
      "title": "string",
      "durationHint": "string",
      "objectives": "string",
      "topics": ["string"]
    }
  ]
}

Requirements:
- Exactly 3 sessions
- 4 topics per session
- Interview focused
- Industry relevant
- No generic topics
- Topics must be specific to the role
`;

  const result = await generateContentWithRetry(model, prompt, {
    label: "prep-plan",
    retries: 3,
  });

  const text = result.response.text();

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    role: roleInput,
    matchedTemplate: "ai-generated",
    sessions: parsed.sessions,
  };
}
