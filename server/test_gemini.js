import { generateInterviewQuestions } from "./src/services/geminiService.js";

async function test() {
  try {
    console.log("Generating questions...");
    const result = await generateInterviewQuestions("Frontend Developer", "medium");
    console.log("Success:", result);
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
