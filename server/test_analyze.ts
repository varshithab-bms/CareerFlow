import { analyzeResume } from "./src/services/geminiService.js";

async function test() {
  try {
    const text = "Frontend Developer with 5 years experience in React, TypeScript, and Node.js. Built scalable applications.";
    const jobTitle = "Senior Frontend Engineer";
    const result = await analyzeResume(text, jobTitle);
    console.log("SUCCESS:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("FAILED:", err);
  }
}

test();
