/** Prep feature — rule-based interview plans + optional YouTube enrichment. */
export {
  buildOverviewMarkdown,
  generateInterviewPlan,
  normalizeRole,
  resolveRoleTemplate,
  type InterviewPlan,
  type InterviewPlanSession,
  type RoleTemplateId,
} from "./interviewPlan.generator.js";

export {
  generatePrepContent,
  type PrepPlanDto,
  type PrepSessionDto,
  type PrepTopicDto,
  type PrepVideoDto,
} from "./prep.service.js";
