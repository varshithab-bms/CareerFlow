export type RoleTemplateId = "ai-generated" | "rule-based";

export interface InterviewPlanSession {
  title: string;
  topics: string[];
  dsaTopics?: string[];
  aptitudeTopics?: string[];
  durationHint: string;
  objectives: string;
}

export interface InterviewPlan {
  role: string;
  matchedTemplate: RoleTemplateId;
  sessions: InterviewPlanSession[];
}
