import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "../../config/ai";

export type AiProviderErrorType = 
  | "AI_AUTH_ERROR"
  | "AI_RATE_LIMITED"
  | "AI_MODEL_ERROR"
  | "AI_INVALID_RESPONSE"
  | "AI_PROVIDER_UNAVAILABLE"
  | "AI_TIMEOUT"
  | "UNKNOWN_ERROR";

export class AiProviderError extends Error {
  constructor(public type: AiProviderErrorType, message: string) {
    super(message);
    this.name = "AiProviderError";
  }
}

export async function callGeminiStructured(systemInstruction: string, inputData: any, schema: any): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiProviderError("AI_AUTH_ERROR", "GEMINI_API_KEY is not configured.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // We are converting Zod schema to a basic Gemini-compatible schema format if needed,
    // or just relying on response_mime_type: "application/json".
    // For robust JSON generation without native structured outputs in older/alternative SDKs:
    const response = await ai.models.generateContent({
      model: AI_CONFIG.model,
      contents: JSON.stringify(inputData, null, 2),
      config: {
        systemInstruction: systemInstruction,
        temperature: AI_CONFIG.temperature,
        responseMimeType: "application/json"
      }
    });

    if (!response.text) {
      throw new AiProviderError("AI_INVALID_RESPONSE", "Received empty response from Gemini.");
    }

    try {
      return JSON.parse(response.text);
    } catch (parseErr) {
      throw new AiProviderError("AI_INVALID_RESPONSE", "Response was not valid JSON.");
    }

  } catch (error: any) {
    if (error instanceof AiProviderError) {
      throw error;
    }
    
    const msg = error.message || "";
    if (msg.includes("API key not valid") || msg.includes("Permission denied")) {
      throw new AiProviderError("AI_AUTH_ERROR", "Invalid API credentials.");
    }
    if (msg.includes("429") || msg.includes("quota") || msg.includes("rate limit")) {
      throw new AiProviderError("AI_RATE_LIMITED", "Provider rate limit exceeded.");
    }
    if (msg.includes("timeout") || msg.includes("abort")) {
      throw new AiProviderError("AI_TIMEOUT", "Provider request timed out.");
    }
    if (msg.includes("503") || msg.includes("502") || msg.includes("unavailable")) {
      throw new AiProviderError("AI_PROVIDER_UNAVAILABLE", "Provider is temporarily unavailable.");
    }
    
    throw new AiProviderError("AI_MODEL_ERROR", "An unexpected model error occurred.");
  }
}
