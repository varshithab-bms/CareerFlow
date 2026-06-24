type GeminiModel = {
  generateContent: (prompt: string) => Promise<any>;
};

export function isGeminiRetryableError(error: unknown) {
  const err = error as { status?: number; message?: string };
  const message = String(err?.message ?? "").toLowerCase();

  return (
    err?.status === 429 ||
    err?.status === 503 ||
    message.includes("429") ||
    message.includes("503") ||
    message.includes("too many requests") ||
    message.includes("quota") ||
    message.includes("service unavailable") ||
    message.includes("high demand")
  );
}

export function getGeminiErrorMessage(error: unknown) {
  const err = error as { message?: string };
  return err?.message || "Gemini request failed";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateContentWithRetry(
  model: GeminiModel,
  prompt: string,
  options: { retries?: number; label?: string } = {},
) {
  const retries = options.retries ?? 3;
  const label = options.label ?? "gemini";

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      const isLastAttempt = attempt === retries;

      if (!isGeminiRetryableError(error) || isLastAttempt) {
        throw error;
      }

      const delayMs = Math.min(1000 * 2 ** attempt, 8000);
      console.warn(
        `[${label}] Gemini rate limited. Retrying in ${delayMs}ms (${attempt + 1}/${retries})`,
      );
      await sleep(delayMs);
    }
  }

  throw new Error("Gemini retry loop ended unexpectedly");
}
