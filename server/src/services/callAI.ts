import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { env } from "../config/env.js";
import {
  generateContentWithRetry,
  getGeminiErrorMessage,
  isGeminiRetryableError,
} from "./geminiRetry.js";
import { ApiError } from "../utils/ApiError.js";

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

function buildAiUnavailableError(geminiError: unknown): ApiError {
  const geminiMessage = getGeminiErrorMessage(geminiError);
  const hint = groq
    ? "Both Gemini and Groq failed. Please retry in a minute."
    : "Gemini quota exceeded. Add GROQ_API_KEY to your server .env as a fallback provider.";

  return new ApiError(503, `${hint} (${geminiMessage})`);
}

/**
 * Try Gemini first; on rate-limit / quota errors fall back to Groq when configured.
 * Optional cacheKey avoids repeat API calls during development (e.g. same role).
 */
export async function callAI(
  prompt: string,
  cacheKey?: string
): Promise<string> {
  if (cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached) {
      console.info(`[callAI] cache hit: ${cacheKey}`);
      return cached;
    }
  }

  let text: string;

  try {
    console.info("[callAI] Using Gemini");
    text = await callGemini(prompt);
  } catch (geminiError) {
    if (!groq || !isGeminiRetryableError(geminiError)) {
      if (isGeminiRetryableError(geminiError) && !groq) {
        throw buildAiUnavailableError(geminiError);
      }
      throw geminiError;
    }

    console.warn(
      "[callAI] Gemini rate limited, falling back to Groq",
      getGeminiErrorMessage(geminiError),
    );

    try {
      text = await callGroq(prompt);
    } catch (groqError) {
      console.error("[callAI] Groq fallback failed", groqError);
      throw buildAiUnavailableError(geminiError);
    }
  }

  if (cacheKey) {
    responseCache.set(cacheKey, text);
  }

  return text;
}

function guessAudioMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".mp4":
    case ".m4a":
      return "audio/mp4";
    case ".ogg":
      return "audio/ogg";
    default:
      return "audio/webm";
  }
}

async function transcribeWithGroq(filePath: string): Promise<string> {
  if (!groq) {
    throw new Error("Groq API key is not configured for transcription");
  }

  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3-turbo",
    response_format: "json",
  });

  const text = transcription.text?.trim();
  if (!text) {
    throw new Error("Groq returned an empty transcription");
  }

  return text;
}

async function transcribeWithGemini(filePath: string): Promise<string> {
  const audioBuffer = fs.readFileSync(filePath);
  const mimeType = guessAudioMimeType(filePath);
  const model = genAI.getGenerativeModel({ model: env.GEMINI_FALLBACK_MODEL });

  const parts = [
    {
      inlineData: {
        mimeType,
        data: audioBuffer.toString("base64"),
      },
    },
    {
      text: "Transcribe the spoken words in this audio exactly. Return only the transcription text with no additional commentary or formatting.",
    },
  ];

  for (let attempt = 0; attempt <= 2; attempt += 1) {
    try {
      const result = await model.generateContent(parts);
      const text = result.response.text().trim();
      if (!text) {
        throw new Error("Gemini returned an empty transcription");
      }
      return text;
    } catch (error) {
      const isLastAttempt = attempt === 2;
      if (!isGeminiRetryableError(error) || isLastAttempt) {
        throw error;
      }

      const delayMs = Math.min(1000 * 2 ** attempt, 8000);
      console.warn(`[transcribe] Gemini retry in ${delayMs}ms (${attempt + 1}/2)`);
      await sleep(delayMs);
    }
  }

  throw new Error("Gemini transcription failed");
}

export async function transcribeAudioFile(filePath: string): Promise<string> {
  if (groq) {
    try {
      console.info("[transcribe] Using Groq Whisper");
      return await transcribeWithGroq(filePath);
    } catch (groqError) {
      console.warn("[transcribe] Groq failed, trying Gemini fallback", groqError);
    }
  }

  try {
    console.info("[transcribe] Using Gemini");
    return await transcribeWithGemini(filePath);
  } catch (geminiError) {
    if (!groq) {
      throw new ApiError(
        503,
        "Transcription unavailable. Configure GROQ_API_KEY for Whisper, or ensure Gemini has quota remaining.",
      );
    }

    throw new ApiError(
      503,
      "Transcription failed on both Groq and Gemini. Please try again shortly.",
    );
  }
}
