import { GoogleGenAI } from '@google/genai';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("GEMINI_API_KEY configured: NO");
    return;
  }
  
  console.log("GEMINI_API_KEY configured: YES");
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Return JSON with {"status":"ok"}',
      config: {
        responseMimeType: "application/json",
      }
    });
    
    console.log("Response text:", response.text);
  } catch (err: any) {
    console.error("Gemini isolation test failed:", err.message);
  }
}

run();
