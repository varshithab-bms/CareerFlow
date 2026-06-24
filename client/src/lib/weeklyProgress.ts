export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type WeeklyGoals = {
  dsa: number;
  aptitude: number;
  interviews: number;
};

export const DEFAULT_WEEKLY_GOALS: WeeklyGoals = {
  dsa: 5,
  aptitude: 3,
  interviews: 2,
};

type AptitudeCompletion = {
  category: string;
  accuracy: number;
  completedAt: number;
};

type BestScore = {
  score: number;
  accuracy: number;
};

export type AptitudeStorage = {
  bests: Record<string, BestScore>;
  completions: AptitudeCompletion[];
};

function parseAptitudeStorage(): AptitudeStorage {
  try {
    const raw = localStorage.getItem("cf_apt_scores");
    if (!raw) return { bests: {}, completions: [] };

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "bests" in parsed) {
      return {
        bests: parsed.bests ?? {},
        completions: Array.isArray(parsed.completions) ? parsed.completions : [],
      };
    }

    // Legacy flat format: { [category]: { score, accuracy } }
    return { bests: parsed ?? {}, completions: [] };
  } catch {
    return { bests: {}, completions: [] };
  }
}

function saveAptitudeStorage(storage: AptitudeStorage) {
  localStorage.setItem("cf_apt_scores", JSON.stringify(storage));
}

export function loadWeeklyGoals(): WeeklyGoals {
  try {
    const raw = localStorage.getItem("cf_weekly_goals");
    if (!raw) return { ...DEFAULT_WEEKLY_GOALS };
    return { ...DEFAULT_WEEKLY_GOALS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_WEEKLY_GOALS };
  }
}

export function saveWeeklyGoals(goals: WeeklyGoals) {
  localStorage.setItem("cf_weekly_goals", JSON.stringify(goals));
}

export function progressPct(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

export function getDsaWeeklyCount(): number {
  try {
    const raw = localStorage.getItem("cf_dsa_done");
    if (!raw) return 0;
    const doneState: Record<string, number> = JSON.parse(raw);
    const weekAgo = Date.now() - ONE_WEEK_MS;
    return Object.values(doneState).filter((timestamp) => timestamp >= weekAgo).length;
  } catch {
    return 0;
  }
}

export function loadAptitudeBests(): Record<string, BestScore> {
  return parseAptitudeStorage().bests;
}

export function recordAptitudeQuizCompletion(
  category: string,
  score: number,
  accuracy: number,
) {
  const storage = parseAptitudeStorage();
  const prev = storage.bests[category];
  if (!prev || score > prev.score) {
    storage.bests[category] = { score, accuracy };
  }
  storage.completions.push({
    category,
    accuracy,
    completedAt: Date.now(),
  });
  saveAptitudeStorage(storage);
}

export function getAptitudeWeeklyStats(): { count: number; avgAccuracy: number } {
  const weekAgo = Date.now() - ONE_WEEK_MS;
  const weekly = parseAptitudeStorage().completions.filter(
    (c) => c.completedAt >= weekAgo,
  );
  if (!weekly.length) return { count: 0, avgAccuracy: 0 };
  const avgAccuracy = Math.round(
    weekly.reduce((sum, c) => sum + c.accuracy, 0) / weekly.length,
  );
  return { count: weekly.length, avgAccuracy };
}

export function getWeeklyInterviewCount(
  interviews: Array<{
    status?: string;
    createdAt?: string;
    isComplete?: boolean;
    finalScore?: number;
  }>,
): number {
  const weekAgo = Date.now() - ONE_WEEK_MS;
  return interviews.filter((interview) => {
    const completed =
      interview.status === "completed" ||
      interview.isComplete ||
      interview.finalScore !== undefined;
    if (!completed) return false;
    if (!interview.createdAt) return false;
    return new Date(interview.createdAt).getTime() >= weekAgo;
  }).length;
}
