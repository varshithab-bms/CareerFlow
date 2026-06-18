import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import {
  generateContentWithRetry,
  getGeminiErrorMessage,
  isGeminiRateLimitError,
} from "./geminiRetry.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

async function generateWithFallback(prompt: string) {
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
  
  try {
    return await generateContentWithRetry(model, prompt, {
      label: env.GEMINI_MODEL,
      retries: 3,
    });
  } catch (error: any) {
    const message = getGeminiErrorMessage(error);
    const cooldownMs = isGeminiRateLimitError(error) ? 3000 : 0;

    console.warn(
      `Primary model failed (${message}). Trying fallback model${cooldownMs ? " after cooldown" : ""}...`,
    );

    if (cooldownMs) {
      await new Promise((resolve) => setTimeout(resolve, cooldownMs));
    }

    const fallbackModel = genAI.getGenerativeModel({ model: env.GEMINI_FALLBACK_MODEL });
    return generateContentWithRetry(fallbackModel, prompt, {
      label: env.GEMINI_FALLBACK_MODEL,
      retries: 2,
    });
  }
}

export async function analyzeResume(resumeText: string, jobTitle: string) {
  if (!jobTitle || jobTitle.trim() === "") {
    jobTitle = "Relevant Professional";
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) optimizer and Senior Technical Recruiter.

Analyze the following resume specifically for a "${jobTitle}" role.

Evaluation Criteria:
1. ATS Compatibility: How well does this resume pass through modern ATS filters for a ${jobTitle} position?
2. Skills Gap: What critical skills or keywords for a ${jobTitle} are missing?
3. Impact: Do the bullet points show measurable results and impact?
4. Formatting: Is the structure clean and professional?

Tasks:
1. Provide an ATS score (0-100) based on alignment with ${jobTitle} expectations.
2. List 3-5 key strengths.
3. List 3-5 specific weaknesses or areas for improvement.
4. Identify 5-10 missing keywords essential for a ${jobTitle}.
5. Rewrite 3 weak bullet points to be more impactful and include metrics.
6. Provide specific feedback on projects and how they relate to ${jobTitle}.
7. Suggest 3-5 final actionable improvements.
8. Write a 2-3 sentence hiring impression from a recruiter's perspective.

IMPORTANT:
- Your analysis must be EXTREMELY specific to the "${jobTitle}" role.
- Return ONLY valid JSON.
- Do not include markdown formatting or backticks in the response.

JSON format:
{
  "atsScore": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingKeywords": ["string"],
  "rewrittenBullets": [
    {
      "original": "string",
      "improved": "string"
    }
  ],
  "projectFeedback": ["string"],
  "finalSuggestions": ["string"],
  "hiringImpression": "string"
}

Resume Text:
${resumeText}`;

  const result = await generateWithFallback(prompt);
  let responseText = result.response.text();

  // Clean up response text if it contains markdown backticks
  responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    // Attempt to find JSON if there's surrounding text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Gemini response:", responseText);
    throw new Error("Failed to parse resume analysis results. Please try again.");
  }
}

export async function tailorResumeForJobDescription(
  resumeText: string,
  jobDescription: string
) {
  const prompt = `You are an expert resume coach and ATS specialist.

Tailor the following resume to the provided job description.

Job Description:
${jobDescription}

Resume:
${resumeText}

Tasks:
1. Identify the strongest matches between this resume and the JD.
2. List important keywords from the JD that are missing or underrepresented.
3. Rewrite up to 5 resume bullets so they better reflect the JD and highlight measurable impact.
4. Provide specific advice for improving resume alignment with the role.

IMPORTANT:
- Return ONLY valid JSON
- Keep responses structured
- Focus on practical, resume-ready guidance

JSON format:
{
  "tailoredSuggestions": ["string"],
  "missingKeywords": ["string"],
  "tailoredResume": "string",
  "jobDescription": "string"
}`;

  const result = await generateWithFallback(prompt);
  const responseText = result.response.text();

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function generateInterviewQuestions(
  role: string,
  difficulty: "easy" | "medium" | "hard"
) {
  const difficultyGuide = {
    easy: "Junior level questions focusing on fundamentals",
    medium: "Mid-level questions requiring practical experience",
    hard: "Senior level questions requiring advanced concepts and system design",
  };

  const prompt = `You are an expert technical interviewer.

Generate interview questions for a ${role} role at ${difficultyGuide[difficulty]} difficulty.

Generate 5 questions that cover:
- Technical fundamentals
- Practical experience
- Problem-solving approach
- Communication skills
- Project understanding

Return ONLY valid JSON with this format:
{
  "role": "${role}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "category": "string" (e.g., "fundamentals", "practical", "design")
    }
  ]
}`;

  const result = await generateWithFallback(prompt);
  const responseText = result.response.text();

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  role: string
) {
  const prompt = `You are an expert technical interviewer evaluating interview answers.

Question: ${question}
Candidate's Answer: ${answer}
Role: ${role}

Evaluate this answer critically. Return ONLY valid JSON:
{
  "score": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvement": "string (specific advice)",
  "followUpQuestion": "string (next question based on answer)",
  "verdict": "string (poor/average/good/excellent)"
}

Be realistic like a real interviewer. Do not praise weak answers unnecessarily.`;

  const result = await generateWithFallback(prompt);
  const responseText = result.response.text();

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

export async function generateFollowUpQuestion(
  previousQuestion: string,
  candidateAnswer: string,
  role: string
) {
  const prompt = `You are an expert technical interviewer.

Based on this previous exchange, generate a thoughtful follow-up question:

Previous Question: ${previousQuestion}
Candidate's Answer: ${candidateAnswer}
Role: ${role}

The follow-up should:
- Build on their answer
- Dig deeper into their understanding
- Test related concepts
- Be challenging but fair

Return ONLY valid JSON:
{
  "followUpQuestion": "string",
  "reasoning": "string (why this question)"
}`;

  const result = await generateWithFallback(prompt);
  const responseText = result.response.text();

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}
