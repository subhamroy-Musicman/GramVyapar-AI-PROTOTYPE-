import { loadEnvConfig } from '@next/env';
import { GoogleGenAI } from '@google/genai';

loadEnvConfig(process.cwd());

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Return exactly this JSON: {\"status\": \"ok\"}",
    });
    console.log("PASS 2.0-flash:", response.text);
  } catch(e: any) {
    console.log("FAIL 2.0-flash:", e.message);
  }
}
run();
