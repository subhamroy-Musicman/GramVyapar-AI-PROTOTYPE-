import { loadEnvConfig } from '@next/env';
import { GoogleGenAI } from '@google/genai';

loadEnvConfig(process.cwd());

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  while (true) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: "Return exactly this JSON: {\"status\": \"ok\"}",
      });
      console.log("PASS:", response.text);
      break;
    } catch(e: any) {
      const msg = e.message;
      if (msg.includes("retry in")) {
        const match = msg.match(/retry in ([\d\.]+)s/);
        if (match) {
          const waitTime = parseFloat(match[1]) + 0.1; // wait exactly until the boundary
          console.log(`Waiting ${waitTime}s...`);
          await new Promise(r => setTimeout(r, waitTime * 1000));
        } else {
          await new Promise(r => setTimeout(r, 1000));
        }
      } else {
         console.log("FAIL:", msg);
         break;
      }
    }
  }
}
run();
