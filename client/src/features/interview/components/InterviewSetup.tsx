import { useState } from "react";
import type { Difficulty } from "../api";

interface InterviewSetupProps {
  onStart: (role: string, difficulty: Difficulty) => void;
  isLoading: boolean;
}

export function InterviewSetup({ onStart, isLoading }: InterviewSetupProps) {
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role.trim()) {
      onStart(role.trim(), difficulty);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Configure Interview</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tailor the mock interview to the specific role and difficulty level you are targeting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-700">
            Target Role (e.g., Frontend Developer)
          </label>
          <input
            id="role"
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="Software Engineer, Product Manager, etc."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`rounded-lg border px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  difficulty === level
                    ? "border-brand bg-brand-soft/20 text-brand"
                    : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!role.trim() || isLoading}
          className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Preparing Session..." : "Start Interview"}
        </button>
      </form>
    </div>
  );
}
