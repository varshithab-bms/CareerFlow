import { callAI } from "../../services/callAI.js";
import { generateRuleBasedInterviewPlan } from "./ruleBasedPlan.generator.js";
import type {
  InterviewPlan,
  InterviewPlanSession,
  RoleTemplateId,
} from "./interviewPlan.types.js";

export type { InterviewPlan, InterviewPlanSession, RoleTemplateId };

const planCache = new Map<string, InterviewPlan>();

function planCacheKey(role: string) {
  return role.trim().toLowerCase();
}

function buildPrompt(roleInput: string) {
  return `
Generate a professional interview preparation roadmap for ${roleInput}.

Return ONLY valid JSON.

Schema:

{
  "sessions": [
    {
      "title": "string",
      "durationHint": "string",
      "objectives": "string",
      "topics": ["string"],
      "dsaTopics": ["string"],
      "aptitudeTopics": ["string"]
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
- For software roles (e.g. SWE, backend, frontend, full-stack, data), populate dsaTopics with relevant algorithms & data structures topics (e.g. Arrays, Trees, DP, Graphs).
- For non-software roles (e.g. PM, data analyst, MBA), populate aptitudeTopics with relevant aptitude topics (e.g. Logical Reasoning, Data Interpretation).
`;
}

function parsePlanJson(text: string): InterviewPlanSession[] {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
    throw new Error("AI response missing sessions array");
  }
  return parsed.sessions;
}

export async function generateInterviewPlan(
  roleInput: string,
): Promise<InterviewPlan> {
  const role = roleInput.trim();
  const cacheKey = planCacheKey(role);

  const cached = planCache.get(cacheKey);
  if (cached) {
    console.info(`[prep-plan] cache hit: ${role}`);
    return cached;
  }

  const ruleBasedPlan = generateRuleBasedInterviewPlan(role);

  try {
    const text = await callAI(buildPrompt(role), `prep-plan:${cacheKey}`);
    const sessions = parsePlanJson(text);
    const plan: InterviewPlan = {
      role,
      matchedTemplate: "ai-generated",
      sessions,
    };
    planCache.set(cacheKey, plan);
    return plan;
  } catch (error) {
    console.warn(
      "[prep-plan] AI generation failed — using rule-based plan:",
      error instanceof Error ? error.message : error,
    );
    planCache.set(cacheKey, ruleBasedPlan);
    return ruleBasedPlan;
  }
}

export { generateRuleBasedInterviewPlan };
