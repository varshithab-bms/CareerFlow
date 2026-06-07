import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./src/config/env.js";

async function testModels() {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const modelsToTest = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello!");
      console.log(`[SUCCESS] ${modelName}:`, result.response.text());
      return; // Return early if one succeeds
    } catch (err: any) {
      console.error(`[FAILED] ${modelName}:`, err.message);
    }
  }
}

testModels();
