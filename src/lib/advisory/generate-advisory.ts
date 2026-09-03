import { AdvisoryInput, AdvisoryResult } from "../../domain/advisory/types";
import { AdvisoryResultSchema } from "../../domain/advisory/schema";
import { callGeminiStructured, AiProviderError } from "../ai/gemini";
import { getSystemInstruction } from "./prompt";

export async function generateAdvisory(input: AdvisoryInput): Promise<AdvisoryResult> {
  const instruction = getSystemInstruction(input.language);
  
  try {
    const rawJson = await callGeminiStructured(instruction, input, AdvisoryResultSchema);
    
    // Strict Zod validation
    const parsed = AdvisoryResultSchema.safeParse(rawJson);
    
    if (!parsed.success) {
      console.error("[advisory] Schema validation failed", parsed.error);
      throw new AiProviderError("AI_INVALID_RESPONSE", "Schema validation failed for AI output.");
    }

    // Grounding Check (Lightweight validation)
    if (parsed.data.language !== input.language) {
      console.error("[advisory] Language mismatch");
      throw new AiProviderError("AI_INVALID_RESPONSE", "AI output language did not match requested language.");
    }

    return parsed.data;
  } catch (error) {
    console.error("[advisory] Failed to generate advisory:", error);
    throw error;
  }
}
