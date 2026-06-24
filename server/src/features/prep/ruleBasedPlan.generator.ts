import type { InterviewPlan, InterviewPlanSession } from "./interviewPlan.types.js";

function isSoftwareRole(role: string): boolean {
  const normalized = role.toLowerCase();
  return /software|engineer|developer|devops|swe|backend|frontend|full.?stack|data scientist|machine learning|\bml\b|mobile|ios|android|cloud|platform/.test(
    normalized,
  );
}

function softwareSessions(role: string): InterviewPlanSession[] {
  return [
    {
      title: "Core CS & Language Fundamentals",
      durationHint: "3–4 days",
      objectives: `Build a solid foundation in data structures, algorithms, and core skills for a ${role} role.`,
      topics: [
        "Time & space complexity analysis",
        "Arrays, strings & hash maps",
        "OOP, SOLID & clean code practices",
        "Debugging, testing & code review",
      ],
      dsaTopics: ["Arrays", "Hash Maps", "Two Pointers", "Stacks & Queues"],
    },
    {
      title: "Applied DSA & System Thinking",
      durationHint: "4–5 days",
      objectives: "Practice medium-level problems and explain trade-offs like in a real technical interview.",
      topics: [
        "Trees, graphs & traversal patterns",
        "Dynamic programming fundamentals",
        "API design & REST basics",
        "Scalability, caching & database trade-offs",
      ],
      dsaTopics: ["Trees", "Graphs", "Dynamic Programming", "Binary Search"],
    },
    {
      title: "Role-Specific & Behavioral Round",
      durationHint: "2–3 days",
      objectives: `Connect your projects to ${role} expectations and practice structured behavioral answers.`,
      topics: [
        "Project deep-dives & ownership stories",
        "STAR method for behavioral questions",
        "Trade-off discussions & system design lite",
        "Company research & thoughtful questions to ask",
      ],
      dsaTopics: ["Heaps", "Sliding Window", "Graph BFS/DFS", "Greedy"],
    },
  ];
}

function generalSessions(role: string): InterviewPlanSession[] {
  return [
    {
      title: "Role Foundations & Domain Knowledge",
      durationHint: "3–4 days",
      objectives: `Understand core concepts, terminology, and expectations for a ${role} position.`,
      topics: [
        "Role responsibilities & success metrics",
        "Industry tools & workflows",
        "Case study or scenario analysis",
        "Professional communication & stakeholder management",
      ],
      aptitudeTopics: ["Logical Reasoning", "Reading Comprehension", "Basic Quant", "Data Interpretation"],
    },
    {
      title: "Problem Solving & Analytical Skills",
      durationHint: "3–4 days",
      objectives: "Practice structured thinking, data interpretation, and decision-making under time pressure.",
      topics: [
        "Structured problem-solving frameworks",
        "Data interpretation & basic analytics",
        "Prioritization & trade-off analysis",
        "Written & verbal presentation skills",
      ],
      aptitudeTopics: ["Syllogisms", "Charts & Tables", "Percentages & Ratios", "Pattern Recognition"],
    },
    {
      title: "Interview Simulation & Behavioral Prep",
      durationHint: "2–3 days",
      objectives: "Prepare concise stories, handle follow-ups, and demonstrate fit for the role.",
      topics: [
        "STAR stories aligned to the role",
        "Handling situational & competency questions",
        "Mock Q&A with timed responses",
        "Questions to ask interviewers",
      ],
      aptitudeTopics: ["Verbal Analogies", "Critical Reasoning", "Speed Arithmetic", "Error Detection"],
    },
  ];
}

export function generateRuleBasedInterviewPlan(roleInput: string): InterviewPlan {
  const role = roleInput.trim();
  const sessions = isSoftwareRole(role) ? softwareSessions(role) : generalSessions(role);

  return {
    role,
    matchedTemplate: "rule-based",
    sessions,
  };
}
