import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { env } from "../config/env.js";
import {
  generateContentWithRetry,
  getGeminiErrorMessage,
  isGeminiRetryableError,
} from "./geminiRetry.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const groq = env.GROQ_API_KEY ? new Groq({ apiKey: env.GROQ_API_KEY }) : null;

const responseCache = new Map<string, string>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt: string): Promise<string> {
  const primaryModel = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });

  try {
    const result = await generateContentWithRetry(primaryModel, prompt, {
      label: env.GEMINI_MODEL,
      retries: 3,
    });
    return result.response.text();
  } catch (error) {
    const message = getGeminiErrorMessage(error);
    const cooldownMs = isGeminiRetryableError(error) ? 3000 : 0;

    console.warn(
      `Primary model failed (${message}). Trying fallback model${cooldownMs ? " after cooldown" : ""}...`,
    );

    if (cooldownMs) {
      await sleep(cooldownMs);
    }

    const fallbackModel = genAI.getGenerativeModel({ model: env.GEMINI_FALLBACK_MODEL });
    const result = await generateContentWithRetry(fallbackModel, prompt, {
      label: env.GEMINI_FALLBACK_MODEL,
      retries: 2,
    });
    return result.response.text();
  }
}

async function callGroq(prompt: string): Promise<string> {
  if (!groq) {
    throw new Error("Groq API key is not configured");
  }

  const res = await groq.chat.completions.create({
    model: env.GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  const content = res.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return content;
}

/**
 * Try Gemini first; on rate-limit / quota errors fall back to Groq when configured.
 * Optional cacheKey avoids repeat API calls during development (e.g. same role).
 */
export async function callAI(prompt: string, cacheKey?: string): Promise<string> {
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached) {
      console.info(`[callAI] cache hit: ${cacheKey}`);
      return cached;
    }
  }

  let text: string;

  try {
    text = await callGemini(prompt);
  } catch (error) {
    if (isGeminiRetryableError(error) && groq) {
      console.warn("[callAI] Gemini rate limited — falling back to Groq");
      text = await callGroq(prompt);
    } else {
      throw error;
    }
  }

  if (cacheKey) {
    responseCache.set(cacheKey, text);
  }

  return text;
}

export function clearAICache() {
  responseCache.clear();
}

export function getAICacheSize() {
  return responseCache.size;
}
