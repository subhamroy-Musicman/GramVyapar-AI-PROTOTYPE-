import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import type { AdvisoryRequest } from '@/app/api/advisory/route';

const MODEL_NAME = 'gemini-3.6-flash';

const AdvisoryResponseSchema = z.object({
  summary: z.string(),
  whyThisDecision: z.string(),
  strongestFactor: z.string(),
  biggestRisk: z.string(),
  stressExplanation: z.string().optional(),
  localMarketExplanation: z.string().optional(),
  recommendedActions: z.array(z.string()),
  evidenceCaveat: z.string()
});

export type AdvisoryResponse = z.infer<typeof AdvisoryResponseSchema>;

export async function generateAdvisory(data: AdvisoryRequest): Promise<AdvisoryResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  const LANGUAGE_MAP: Record<string, string> = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "bn": "Bengali (বাংলা)",
    "mr": "Marathi (मराठी)",
    "ta": "Tamil (தமிழ்)"
  };
  
  const targetLanguage = LANGUAGE_MAP[data.language || "en"] || "English";
  
  console.log(`[advisory] requestedLanguage=${targetLanguage}`);

  const systemInstruction = `You are the explanation layer of GramVyapar AI.

The requested output language is ${targetLanguage}.

Return ALL natural-language advisory content in ${targetLanguage}.

The JSON keys must remain unchanged in English.

Do not translate:
- currency symbols
- numeric values
- evidence counts
- internal decision enum values where used internally

Do not recalculate or modify any value.

Use simple ${targetLanguage} suitable for a rural micro-entrepreneur.

You receive an already-computed rural micro-enterprise assessment.

All supplied financial values, evidence values, stress-test results and decision classifications are authoritative.

Never recalculate them.
Never change the decision.
Never invent:
- competitors
- customers
- market demand
- government schemes
- loan eligibility
- milk prices
- weather
- local evidence

If evidence is insufficient or unavailable, explicitly say so.

Clearly distinguish:
- USER INPUT
- CALCULATED
- LIVE EVIDENCE
- PROTOTYPE ASSUMPTION
- DATA UNAVAILABLE

Use clear, simple language suitable for a rural micro-entrepreneur. Avoid overly formal language.

Explain:
1. why this decision was generated
2. strongest positive factor
3. biggest financial risk
4. stress-test implication
5. local evidence implication
6. recommended next actions

Do not guarantee:
- profitability
- loan approval
- market demand
- business success

Do not present prototype guidance as professional financial advice.
Do not contradict the deterministic engine.

OSM Evidence Grounding:
- If market reach is X, say "X mapped market/activity signals", never "X customers" or "X buyers".
- If dairy signals are X, say "X mapped dairy-related signals", never "exactly X dairy businesses".
- If local evidence is PROVIDER_UNAVAILABLE, say "Live local mapping evidence could not be retrieved for this assessment."
- If INSUFFICIENT, say "Available mapped evidence is too limited to make a strong local competition conclusion."

Open-Meteo Grounding:
- Weather data must be explained only as environmental context. Do not use weather to conclude overall business viability.

Return valid JSON exactly matching the requested schema.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: JSON.stringify(data),
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING" },
            whyThisDecision: { type: "STRING" },
            strongestFactor: { type: "STRING" },
            biggestRisk: { type: "STRING" },
            stressExplanation: { type: "STRING" },
            localMarketExplanation: { type: "STRING" },
            recommendedActions: { type: "ARRAY", items: { type: "STRING" } },
            evidenceCaveat: { type: "STRING" }
          },
          required: ["summary", "whyThisDecision", "strongestFactor", "biggestRisk", "recommendedActions", "evidenceCaveat"]
        },
        temperature: 0.2
      }
    });

    let text = response.text;
    console.log("[advisory] Gemini response received");
    
    if (!text) {
      console.log("[advisory] FAILED stage=parsing error=Empty response text");
      return null;
    }

    // Strip markdown formatting if Gemini wrapped it in ```json ... ```
    text = text.replace(/^```json\n?/g, '').replace(/\n?```$/g, '').trim();

    const parsed = JSON.parse(text);
    console.log("[advisory] response parsed");
    console.log(`[advisory] responseLanguageCheck=${parsed.summary?.substring(0, 30)}...`);
    
    const validated = AdvisoryResponseSchema.safeParse(parsed);
    
    if (validated.success) {
      console.log("[advisory] schema validation passed");
      return validated.data;
    }
    
    console.log("[advisory] FAILED stage=validation error=Schema validation failed");
    return null;
  } catch (error: unknown) {
    console.log(`[advisory] FAILED stage=api_call error=${(error as Error)?.message || "Unknown error"}`);
    return null;
  }
}

export async function generateAdvisoryQuestion(data: AdvisoryRequest, question: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });
  
  const LANGUAGE_MAP: Record<string, string> = {
    "en": "English", "hi": "Hindi", "bn": "Bengali", "mr": "Marathi", "ta": "Tamil"
  };
  const targetLanguage = LANGUAGE_MAP[data.language || "en"] || "English";
  
  const systemInstruction = `You are a strict QA layer for GramVyapar AI. The requested response language is ${targetLanguage}. Answer the question in ${targetLanguage}. Keep numbers and currency values identical to the supplied assessment.

You receive a computed rural micro-enterprise assessment and a user question.

RULES:
1. Answer using ONLY the supplied assessment.
2. Do not recalculate financial values.
3. Do not change the decision.
4. Do not invent competitors, customers, prices, schemes, weather or market demand.
5. If the supplied assessment does not contain enough information, say that the available assessment does not provide enough evidence.
6. Return ONLY the plain text answer, no markdown, no JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: JSON.stringify(data) + `\n\nUser Question: ${question}`,
      config: { systemInstruction }
    });
    return response.text || null;
  } catch(err: unknown) {
    console.error("[advisory-question] FAILED", (err as Error).message);
    return null;
  }
}

