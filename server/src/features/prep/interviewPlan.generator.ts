/**
 * Rule-based interview preparation planner — no external AI APIs.
 * Normalizes role input, picks a template or falls back to a generic track.
 */

export type RoleTemplateId =
  | "frontend"
  | "backend"
  | "fullstack"
  | "dataAnalyst"
  | "softwareEngineer"
  | "generic";

export interface InterviewPlanSession {
  title: string;
  topics: string[];
  durationHint: string;
  objectives: string;
}

export interface InterviewPlan {
  /** Normalized display role */
  role: string;
  matchedTemplate: RoleTemplateId;
  sessions: InterviewPlanSession[];
}

type SessionBlock = Omit<InterviewPlanSession, never>;

const FRONTEND_SESSIONS: SessionBlock[] = [
  {
    title: "Session 1: JavaScript, browser & rendering",
    durationHint: "45–60 min",
    objectives:
      "Solidify language fundamentals and how UIs actually load, paint, and respond to users.",
    topics: [
      "Closures, `this`, event loop, and microtasks vs macrotasks",
      "DOM/CSS layout: flex vs grid, specificity, responsive breakpoints",
      "Fetch, CORS, cookies vs tokens, and handling loading/error UX states",
      "Accessibility basics: semantics, focus, ARIA when needed",
    ],
  },
  {
    title: "Session 2: Frontend architecture & performance",
    durationHint: "60–75 min",
    objectives:
      "Practice how you structure apps and explain tradeoffs hiring managers care about.",
    topics: [
      "Component patterns (container/presentational), hooks pitfalls, dependency arrays",
      "Client state vs server state; caching (React Query / SWR mental model)",
      "Performance: lazy loading, memoization when it helps, Core Web Vitals",
      "Testing pyramid for UI: unit vs integration; mocking boundaries",
    ],
  },
  {
    title: "Session 3: Frontend system design & behavioral depth",
    durationHint: "60–90 min",
    objectives:
      "Whiteboard-style frontend design plus strong behavioral signal.",
    topics: [
      "Design a feed or dashboard: data flow, pagination, optimistic UI",
      "Cross-cutting concerns: i18n, theming, feature flags at scale",
      "Behavioral: conflicts on UI polish vs deadlines; STAR stories from real launches",
    ],
  },
];

const BACKEND_SESSIONS: SessionBlock[] = [
  {
    title: "Session 1: APIs, languages & correctness",
    durationHint: "45–60 min",
    objectives:
      "Demonstrate you can ship reliable services and reason about contracts.",
    topics: [
      "REST vs RPC vs events; idempotency and safe retries",
      "Strong typing, validation at boundaries, error mapping and status codes",
      "AuthN/Z patterns: sessions, JWT tradeoffs, OAuth2 flows at high level",
      "Concurrency basics: races, locks, async pitfalls in your stack",
    ],
  },
  {
    title: "Session 2: Data, persistence & caching",
    durationHint: "60–75 min",
    objectives:
      "Show depth on how data is modeled, queried, and kept consistent.",
    topics: [
      "SQL modeling: normalization vs denormalization; indexes that matter",
      "Transactions, isolation levels, and when you choose NoSQL",
      "Caching layers (Redis): TTL, stampede, cache invalidation strategies",
      "Migrations, backward-compatible schema changes, zero-downtime deploys",
    ],
  },
  {
    title: "Session 3: Distributed systems & leadership signal",
    durationHint: "60–90 min",
    objectives:
      "Discuss scaling, reliability, and how you operate systems in production.",
    topics: [
      "Queues, workers, DLQs; at-least-once vs exactly-once pragmatism",
      "Observability: structured logs, metrics, traces; alerting that reduces noise",
      "Rate limiting, circuit breakers, graceful degradation",
      "Behavioral: incident response, postmortems without blame, mentoring juniors",
    ],
  },
];

const FULLSTACK_SESSIONS: SessionBlock[] = [
  {
    title: "Session 1: End-to-end ownership",
    durationHint: "45–60 min",
    objectives:
      "Prove you can trace a feature from UI contract through API to persistence.",
    topics: [
      "Designing CRUD with validation on both sides; DTOs and consistency",
      "Auth flows across SPA and API; CSRF/CORS mental model",
      "Environment parity: local vs staging; feature flags for risky paths",
    ],
  },
  {
    title: "Session 2: Data modeling & API ergonomics",
    durationHint: "60–75 min",
    objectives:
      "Balance database design with developer experience for consumers of your API.",
    topics: [
      "REST resource modeling; pagination strategies (cursor vs offset)",
      "Database joins vs aggregate queries; N+1 detection and fixes",
      "Background jobs triggered from UI actions; eventual consistency UX",
    ],
  },
  {
    title: "Session 3: Delivery, testing & tradeoffs",
    durationHint: "60–90 min",
    objectives:
      "Ship confidently and articulate engineering tradeoffs across the stack.",
    topics: [
      "Integration testing across API + DB; contract tests at boundaries",
      "CI/CD habits: migrations in pipeline, rollback strategy",
      "System design lite: notification service or billing webhook flow",
      "Behavioral: juggling frontend polish with backend deadlines",
    ],
  },
];

const DATA_ANALYST_SESSIONS: SessionBlock[] = [
  {
    title: "Session 1: SQL, data quality & metrics",
    durationHint: "45–60 min",
    objectives:
      "Show strong analytical SQL and clarity on what “good data” means.",
    topics: [
      "Joins, window functions, cohort-style queries",
      "Null handling, duplicates, slowly changing dimensions (conceptual)",
      "Defining KPIs: numerator/denominator pitfalls; reproducibility",
      "Sanity checks and anomaly intuition before presenting numbers",
    ],
  },
  {
    title: "Session 2: Visualization & storytelling",
    durationHint: "60 min",
    objectives:
      "Communicate insights stakeholders act on—without misleading charts.",
    topics: [
      "Choosing chart types; avoiding truncating axes; labeling clearly",
      "Executive summaries vs appendix detail; appendix discipline",
      "Experiment readouts: significance vs practical effect size (conceptual)",
    ],
  },
  {
    title: "Session 3: Case interviews & stakeholder drill",
    durationHint: "60–75 min",
    objectives:
      "Practice structured thinking under ambiguity—the classic analyst screen.",
    topics: [
      "Market sizing / funnel decomposition frameworks",
      "Root-cause drill: metric dropped—how you narrow hypotheses",
      "Stakeholder pushback: defending methodology calmly",
    ],
  },
];

const SOFTWARE_ENGINEER_SESSIONS: SessionBlock[] = [
  {
    title: "Session 1: Coding fundamentals & problem decomposition",
    durationHint: "45–60 min",
    objectives:
      "Refresh patterns interview loops still lean on: arrays, graphs, hashing.",
    topics: [
      "Complexity intuition; when hash maps / heaps win",
      "Two pointers, sliding window, BFS/DFS tradeoffs",
      "Testing your own code: edge cases, invariants",
    ],
  },
  {
    title: "Session 2: Design & architecture fundamentals",
    durationHint: "60–75 min",
    objectives:
      "Move beyond LeetCode—discuss APIs, modules, and scaling vocabulary.",
    topics: [
      "OO vs functional seams in large codebases",
      "Design a URL shortener / rate limiter at high level",
      "Tradeoffs: consistency vs availability in plain language",
    ],
  },
  {
    title: "Session 3: Collaboration & senior signal",
    durationHint: "60 min",
    objectives:
      "Behavioral depth: ownership, clarity, and calm under ambiguity.",
    topics: [
      "STAR stories: conflict, missed deadline, mentoring, influence without authority",
      "How you review code and receive feedback",
      "Questions you ask interviewers to judge team quality",
    ],
  },
];

const GENERIC_SESSIONS: SessionBlock[] = [
  {
    title: "Session 1: Role fundamentals & scope",
    durationHint: "45–60 min",
    objectives:
      "Clarify what the role delivers, how success is measured, and how you map your experience.",
    topics: [
      "Day-to-day responsibilities and stakeholders for this title",
      "Skills interviewers probe first for this discipline",
      "Mapping your resume bullets to measurable outcomes",
    ],
  },
  {
    title: "Session 2: Core interview depth",
    durationHint: "60–75 min",
    objectives:
      "Practice answering technical or scenario questions clearly and concisely.",
    topics: [
      "Problem-solving structure: clarify → plan → execute → verify",
      "Deep questions likely for your seniority level",
      "How to admit unknowns without losing credibility",
    ],
  },
  {
    title: "Session 3: Advanced themes & mock practice",
    durationHint: "60–90 min",
    objectives:
      "Stretch into design/architecture where relevant and rehearse out loud.",
    topics: [
      "System or workflow design at the right altitude for the role",
      "Tradeoff vocabulary: latency, cost, risk, maintainability",
      "Full mock: timed prompts + STAR follow-ups",
    ],
  },
];

const TEMPLATE_MAP: Record<RoleTemplateId, SessionBlock[]> = {
  frontend: FRONTEND_SESSIONS,
  backend: BACKEND_SESSIONS,
  fullstack: FULLSTACK_SESSIONS,
  dataAnalyst: DATA_ANALYST_SESSIONS,
  softwareEngineer: SOFTWARE_ENGINEER_SESSIONS,
  generic: GENERIC_SESSIONS,
};

/** Trim, collapse whitespace, keep original casing for display unless empty. */
export function normalizeRole(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/** Resolve template from normalized free-text role (case-insensitive). */
export function resolveRoleTemplate(normalizedRole: string): RoleTemplateId {
  const n = normalizedRole.toLowerCase();

  if (/\bfull[\s-]?stack\b/.test(n) || n.includes("fullstack")) {
    return "fullstack";
  }
  if (/\bfront[\s-]?end\b/.test(n) || n.includes("frontend")) {
    return "frontend";
  }
  if (/\bback[\s-]?end\b/.test(n) || n.includes("backend")) {
    return "backend";
  }
  if (/\bdata\s+analyst\b/.test(n) || (n.includes("analyst") && n.includes("data"))) {
    return "dataAnalyst";
  }
  if (
    /\bsoftware\s+engineer\b/.test(n) ||
    /\bswe\b/.test(n) ||
    (n.includes("engineer") && n.includes("software"))
  ) {
    return "softwareEngineer";
  }

  return "generic";
}

export function buildOverviewMarkdown(
  displayRole: string,
  template: RoleTemplateId,
): string {
  const hooks: Record<RoleTemplateId, string> = {
    frontend:
      "Interviewers want proof you can ship accessible, performant UIs and explain tradeoffs across browser, framework, and API boundaries.",
    backend:
      "Expect deep questions on APIs, data integrity, reliability, and how you operate services under failure and load.",
    fullstack:
      "You'll need to walk features end-to-end—UI contracts, APIs, persistence—without hand-waving the seams.",
    dataAnalyst:
      "Signal comes from rigorous SQL, clean metrics, and storytelling that drives decisions—not chart decoration.",
    softwareEngineer:
      "Loops typically blend coding, light design, and behavioral depth—clarity and structured thinking matter as much as syntax.",
    generic:
      "Use these sessions to align your story with what this title usually evaluates: fundamentals, depth, and structured communication.",
  };

  return [
    `## Prep overview — ${displayRole}`,
    "",
    hooks[template],
    "",
    "### How to use this plan",
    "",
    "1. Run sessions **in order**—each builds on the last.",
    "2. For every topic, spend **10–15 minutes** jotting talking points before expanding aloud.",
    "3. Record yourself once per session; tighten answers that ramble.",
    "",
    "_Generated locally with rule-based templates—no external AI API required._",
  ].join("\n");
}

/**
 * Core generator: returns exactly three sessions with concrete topic strings.
 */
export function generateInterviewPlan(roleInput: string): InterviewPlan {
  const role = normalizeRole(roleInput);
  if (!role) {
    throw new Error("Role is required");
  }

  const matchedTemplate = resolveRoleTemplate(role);
  const blocks = TEMPLATE_MAP[matchedTemplate];

  const sessions: InterviewPlanSession[] = blocks.map((b) => ({
    title: b.title,
    topics: [...b.topics],
    durationHint: b.durationHint,
    objectives: b.objectives,
  }));

  return {
    role,
    matchedTemplate,
    sessions,
  };
}
