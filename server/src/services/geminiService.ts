import { callAI } from "./callAI.js";

function extractJson(text: string): string {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }
  return jsonMatch[0];
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

  const responseText = await callAI(prompt);
  const jsonString = extractJson(responseText);

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse resume analysis response:", responseText);
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

  const responseText = await callAI(prompt);
  return JSON.parse(extractJson(responseText));
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
      "category": "string (fundamentals, practical, or design)"
    }
  ]
}`;

  const cacheKey = `interview-q:${role.trim().toLowerCase()}:${difficulty}`;
  const responseText = await callAI(prompt, cacheKey);
  return JSON.parse(extractJson(responseText));
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

Evaluate this answer critically. Return ONLY valid JSON with the following format, where score is a number between 0-100:
{
  "score": 85,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "improvement": "string (specific advice)",
  "followUpQuestion": "string (next question based on answer)",
  "verdict": "string (poor/average/good/excellent)"
}

Be realistic like a real interviewer. Do not praise weak answers unnecessarily.`;

  const responseText = await callAI(prompt);
  return JSON.parse(extractJson(responseText));
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

  const responseText = await callAI(prompt);
  return JSON.parse(extractJson(responseText));
}

export async function generateDSAInterviewQuestion(
  role: string,
  difficulty: "easy" | "medium" | "hard",
  topic: string
) {
  const difficultyGuide = {
    easy: "Simple problems with straightforward solutions, O(n) or O(n log n) time complexity",
    medium: "Problems requiring optimal approaches, some trade-offs, O(n) or better time complexity",
    hard: "Complex problems requiring advanced algorithms, optimal solutions, careful edge case handling",
  };

  const prompt = `You are an expert coding interview coach specializing in ${topic} problems for ${role} roles.

Generate a coding problem for a ${role} role at ${difficultyGuide[difficulty]} difficulty focusing on ${topic}.

Requirements:
1. Provide a clear, concise problem title (similar to LeetCode titles, e.g., "Two Sum", "Maximum Subarray")
2. Write a detailed problem statement without revealing the solution
3. Specify constraints (input size, value ranges, etc.)
4. Provide 2-3 input/output examples with explanations
5. Give a hint about the approach (not the full solution)
6. Define evaluation criteria (what makes a good solution)

Return ONLY valid JSON with this format:
{
  "problemTitle": "string (concise title like LeetCode)",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "problemStatement": "string (detailed description)",
  "constraints": "string (input/output constraints)",
  "examples": [
    "string (example 1 with input and output)",
    "string (example 2 with input and output)"
  ],
  "approachHint": "string (hint about the approach, not the solution)",
  "evaluationCriteria": "string (what makes a good solution: time complexity, space complexity, edge cases)"
}

IMPORTANT:
- Do NOT include any code solution
- Make the problem realistic and interview-appropriate
- Ensure the problem is solvable within interview time constraints`;

  const cacheKey = `dsa-q:${topic.trim().toLowerCase()}:${difficulty}:${role.trim().toLowerCase()}`;
  const responseText = await callAI(prompt, cacheKey);
  return JSON.parse(extractJson(responseText));
}

export async function evaluateDSAAnswer(
  question: string,
  code: string,
  role: string,
  topic: string,
  difficulty: "easy" | "medium" | "hard"
) {
  const prompt = `You are an expert coding interviewer evaluating a candidate's solution.

Problem: ${question}
Topic: ${topic}
Difficulty: ${difficulty}
Role: ${role}

Candidate's Code:
\`\`\`
${code}
\`\`\`

Evaluate this solution critically and realistically. Return ONLY valid JSON with the following format, where numeric fields are just numbers:
{
  "correctness": 8,
  "timeComplexity": "string (e.g., O(n), O(n log n), O(n^2))",
  "spaceComplexity": "string (e.g., O(1), O(n), O(n^2))",
  "edgeCasesCovered": true,
  "codeQuality": "string (Poor/Fair/Good/Excellent)",
  "overallScore": 85,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestions": ["string (specific actionable improvements)"]
}

Be realistic like a real interviewer. Do not praise incorrect or inefficient solutions unnecessarily.
Consider:
- Does the algorithm solve the problem correctly?
- Is the time complexity optimal for the given difficulty?
- Is the space complexity reasonable?
- Are edge cases (empty input, single element, duplicates, etc.) handled?
- Is the code clean, readable, and well-structured?`;

  const responseText = await callAI(prompt);
  return JSON.parse(extractJson(responseText));
}
