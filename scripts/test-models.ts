import { loadEnvConfig } from '@next/env';
import { GoogleGenAI } from '@google/genai';

loadEnvConfig(process.cwd());

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const models = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro", "gemini-2.5-flash"];
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const response = await ai.models.generateContent({
        model: m,
        contents: "Return exactly this JSON: {\"status\": \"ok\"}",
      });
      console.log(`PASS ${m}:`, response.text);
    } catch(e: any) {
      console.log(`FAIL ${m}:`, e.message);
    }
  }
}
run();
