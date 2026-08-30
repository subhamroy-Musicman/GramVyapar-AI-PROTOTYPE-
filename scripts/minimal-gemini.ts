import { loadEnvConfig } from '@next/env';
import { GoogleGenAI } from '@google/genai';

loadEnvConfig(process.cwd());

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Return exactly this JSON: {\"status\": \"ok\"}",
      config: {
        responseMimeType: "application/json"
      }
    });
    console.log("PASS:", response.text);
  } catch(e: any) {
    console.log("FAIL:", e.message);
  }
}

run();
