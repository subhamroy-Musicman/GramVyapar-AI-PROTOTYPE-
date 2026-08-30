import { loadEnvConfig } from '@next/env';
import { GoogleGenAI } from '@google/genai';

loadEnvConfig(process.cwd());

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API_KEY_CONFIGURED =", apiKey ? "YES" : "NO");
  const model = "gemini-3.6-flash";
  console.log("MODEL =", model);
  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log("REQUEST_SENT = YES");
    const response = await ai.models.generateContent({
      model: model,
      contents: "Return only this JSON: {\"status\": \"ok\"}",
    });
    console.log("RESPONSE_RECEIVED = YES");
    console.log("RAW_TEXT_PRESENT =", response.text ? "YES" : "NO");
    console.log(response.text);
  } catch(e: any) {
    console.log("FAIL:", e.message);
  }
}
run();
