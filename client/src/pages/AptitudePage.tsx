import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  Trophy,
  XCircle,
} from "lucide-react";
import {
  aptitudeQuestions,
  aptitudeCategories,
  type AptitudeTab,
  type AptitudeCategory,
  type AptitudeQuestion,
} from "../data/aptitudeQuestions";
import {
  loadAptitudeBests,
  recordAptitudeQuizCompletion,
} from "../lib/weeklyProgress";

const QUIZ_DURATION = 15 * 60; // 15 minutes in seconds
const QUESTIONS_PER_QUIZ = 10;

type BestScores = Record<string, { score: number; accuracy: number }>;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type QuizState = "idle" | "running" | "finished";

export function AptitudePage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") as AptitudeCategory | null;

  let initialTab: AptitudeTab = "Quantitative";
  let resolvedCategory: AptitudeCategory =
  aptitudeCategories["Quantitative"][0]!;

  if (initialCategory) {
    for (const tab of ["Quantitative", "Logical", "Verbal"] as AptitudeTab[]) {
      if ((aptitudeCategories[tab] as string[]).includes(initialCategory)) {
        initialTab = tab;
        resolvedCategory = initialCategory;
        break;
      }
    }
  }

  const [activeTab, setActiveTab] = useState<AptitudeTab>(initialTab);
  const [activeCategory, setActiveCategory] = useState<AptitudeCategory>(resolvedCategory);
  const [bestScores, setBestScores] = useState<BestScores>(loadAptitudeBests);

  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [revealedAnswers, setRevealedAnswers] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endQuiz = useCallback(
    (answers: (number | null)[], elapsedSeconds: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setQuizState("finished");
      setTimeTaken(elapsedSeconds);

      const correct = answers.filter(
        (ans, i) => ans === questions[i]?.correctIndex
      ).length;
      const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      recordAptitudeQuizCompletion(activeCategory, correct, accuracy);
      setBestScores(loadAptitudeBests());
    },
    [questions, activeCategory]
  );

  useEffect(() => {
    if (quizState !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          endQuiz(selectedAnswers, elapsed);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState, startTime, selectedAnswers, endQuiz]);

  const startQuiz = () => {
    const pool = aptitudeQuestions.filter((q) => q.category === activeCategory);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_QUIZ);
    setQuestions(shuffled);
    setSelectedAnswers(new Array(shuffled.length).fill(null));
    setRevealedAnswers(new Array(shuffled.length).fill(false));
    setCurrentIndex(0);
    setTimeLeft(QUIZ_DURATION);
    setStartTime(Date.now());
    setQuizState("running");
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswers[currentIndex] !== null) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = optionIndex;
    setSelectedAnswers(newAnswers);

    const newRevealed = [...revealedAnswers];
    newRevealed[currentIndex] = true;
    setRevealedAnswers(newRevealed);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      endQuiz(selectedAnswers, elapsed);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleTabChange = (tab: AptitudeTab) => {
  setActiveTab(tab);
  setActiveCategory(aptitudeCategories[tab][0]!);
  setQuizState("idle");
};

  const handleCategoryChange = (cat: AptitudeCategory) => {
    setActiveCategory(cat);
    setQuizState("idle");
  };

  const currentQ = questions[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== null;
  const isCorrect = isAnswered && selectedAnswers[currentIndex] === currentQ?.correctIndex;
  const correctCount = selectedAnswers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const timerProgress = (timeLeft / QUIZ_DURATION) * 100;
  const best = bestScores[activeCategory];

  // Idle / category selection screen
  if (quizState === "idle") {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Aptitude Practice</h1>
                <p className="text-sm text-slate-500">Quant · Logic · Verbal — Campus Placement Ready</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Tab Bar */}
          <div className="mb-8 flex gap-2 overflow-x-auto">
            {(["Quantitative", "Logical", "Verbal"] as AptitudeTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "bg-brand text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Category Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aptitudeCategories[activeTab].map((cat) => {
              const catBest = bestScores[cat];
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-brand/40 bg-brand/5 ring-2 ring-brand/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <p className={`font-semibold ${isSelected ? "text-brand" : "text-slate-900"}`}>
                    {cat}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {aptitudeQuestions.filter((q) => q.category === cat).length} questions
                  </p>
                  {catBest ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-medium text-slate-600">
                        Best: {catBest.score}/{QUESTIONS_PER_QUIZ} · {catBest.accuracy}% accuracy
                      </span>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">Not attempted yet</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Start Button */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Selected: <span className="font-semibold text-slate-800">{activeCategory}</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                10 questions · 15-minute timer · Instant feedback
              </p>
            </div>
            <button
              onClick={startQuiz}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              Start Quiz
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Quiz finished screen
  if (quizState === "finished") {
    const missedCount = questions.length - correctCount;
    const grade =
      accuracy >= 90 ? "Excellent!" : accuracy >= 70 ? "Good Job!" : accuracy >= 50 ? "Keep Practicing!" : "Needs Improvement";

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{grade}</h2>
            <p className="mt-1 text-sm text-slate-500">{activeCategory}</p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-2xl font-bold text-emerald-700">{correctCount}</p>
              <p className="mt-1 text-xs text-emerald-600">Correct</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-2xl font-bold text-rose-700">{missedCount}</p>
              <p className="mt-1 text-xs text-rose-600">Wrong</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-2xl font-bold text-blue-700">{accuracy}%</p>
              <p className="mt-1 text-xs text-blue-600">Accuracy</p>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Time taken</span>
            <span className="font-semibold text-slate-800">{formatTime(timeTaken)}</span>
          </div>

          {best && (
            <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm">
              <p className="text-amber-700">
                🏆 Best score: <strong>{best.score}/{QUESTIONS_PER_QUIZ}</strong> ({best.accuracy}% accuracy)
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={startQuiz}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => {
                const cats = aptitudeCategories[activeTab];
                const idx = cats.indexOf(activeCategory);
                const next = cats[idx + 1] ?? aptitudeCategories[activeTab][0]!;
handleCategoryChange(next);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Next Topic
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Running quiz screen
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Quiz Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">{activeCategory}</p>
              <p className="text-sm font-bold text-slate-800">
                Question {currentIndex + 1} / {questions.length}
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
                timeLeft < 60
                  ? "bg-rose-50 text-rose-700"
                  : timeLeft < 180
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Timer Progress Bar */}
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timerProgress < 20 ? "bg-rose-500" : timerProgress < 40 ? "bg-amber-500" : "bg-brand"
              }`}
              style={{ width: `${timerProgress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {currentQ && (
          <div className="space-y-6">
            {/* Question Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-base font-medium leading-7 text-slate-900">{currentQ.question}</p>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentQ.options.map((option, idx) => {
                const answered = selectedAnswers[currentIndex] !== null;
                const isChosen = selectedAnswers[currentIndex] === idx;
                const isRight = idx === currentQ.correctIndex;

                let style = "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
                if (answered) {
                  if (isRight) {
                    style = "border-emerald-300 bg-emerald-50 text-emerald-800";
                  } else if (isChosen && !isRight) {
                    style = "border-rose-300 bg-rose-50 text-rose-800";
                  } else {
                    style = "border-slate-100 bg-slate-50 text-slate-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answered}
                    onClick={() => handleAnswer(idx)}
                    className={`flex w-full items-center gap-4 rounded-xl border px-5 py-3.5 text-left text-sm font-medium transition ${style} disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        answered && isRight
                          ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                          : answered && isChosen && !isRight
                          ? "border-rose-400 bg-rose-100 text-rose-700"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {answered && isRight && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {answered && isChosen && !isRight && <XCircle className="h-4 w-4 text-rose-500" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation panel */}
            {isAnswered && (
              <div
                className={`rounded-xl border p-5 text-sm ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-rose-200 bg-rose-50"
                }`}
              >
                <p
                  className={`mb-2 font-semibold ${
                    isCorrect ? "text-emerald-800" : "text-rose-800"
                  }`}
                >
                  {isCorrect ? "✅ Correct!" : "❌ Incorrect — Correct answer: " + currentQ.options[currentQ.correctIndex]}
                </p>
                <p className={`mb-3 ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                  {currentQ.explanation}
                </p>
                <details className="cursor-pointer">
                  <summary className={`text-xs font-semibold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                    Show step-by-step solution
                  </summary>
                  <pre className={`mt-2 whitespace-pre-wrap rounded-lg p-3 text-xs leading-6 ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                    {currentQ.solution}
                  </pre>
                </details>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
                >
                  {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {questions.map((_, i) => {
                const a = selectedAnswers[i];
                const correct = a === questions[i]?.correctIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      i === currentIndex
                        ? "scale-125 bg-brand"
                        : a === null
                        ? "bg-slate-200"
                        : correct
                        ? "bg-emerald-400"
                        : "bg-rose-400"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
