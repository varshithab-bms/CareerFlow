import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./src/config/env.js";

async function listModels() {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map((m: any) => m.name));
  } catch (err) {
    console.error(err);
  }
}

listModels();
