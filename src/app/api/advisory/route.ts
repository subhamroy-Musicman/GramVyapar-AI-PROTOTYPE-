import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAdvisory } from '@/lib/advisory';

export const AdvisoryRequestSchema = z.object({
  business: z.object({
    type: z.string(),
    location: z.string(),
    herdSize: z.number().optional()
  }),
  decision: z.enum(["PROCEED", "MODIFY", "HIGH RISK"]),
  financial: z.object({
    availableCapital: z.number(),
    projectCost: z.number(),
    fundingGap: z.number(),
    indicativeLoan: z.number(),
    annualRevenue: z.number(),
    annualOperatingCost: z.number(),
    operatingSurplus: z.number(),
    repaymentBurden: z.number(),
    postRepaymentCash: z.number()
  }),
  stressTest: z.object({
    scenario: z.string(),
    stressedRevenue: z.number(),
    stressedOperatingCost: z.number(),
    stressedPostRepaymentCash: z.number()
  }),
  localEvidence: z.object({
    marketReach5km: z.number().nullable(),
    marketReach10km: z.number().nullable(),
    directDairySignals5km: z.number().nullable(),
    directDairySignals10km: z.number().nullable(),
    competitorConfidence: z.string().nullable(),
    weatherContext: z.string().nullable(),
    availabilityState: z.enum(["AVAILABLE", "INSUFFICIENT", "PROVIDER_UNAVAILABLE", "AI_UNAVAILABLE"]).optional()
  }),
  language: z.enum(["en", "hi", "bn", "mr", "ta"]).optional().default("en")
});

export type AdvisoryRequest = z.infer<typeof AdvisoryRequestSchema>;

export async function POST(req: Request) {
  try {
    console.log("[advisory] request started");
    const body = await req.json();
    const result = AdvisoryRequestSchema.safeParse(body);
    
    if (!result.success) {
      console.log("[advisory] FAILED stage=validation error=Invalid request schema");
      return NextResponse.json({ status: "AI_UNAVAILABLE", error: "Invalid request schema" }, { status: 400 });
    }
    
    console.log(`[advisory] selectedLanguage=${result.data.language}`);
    console.log("[advisory] request validated");

    if (!process.env.GEMINI_API_KEY) {
      console.log("[advisory] FAILED stage=auth error=GEMINI_API_KEY is not configured providerStatus=MISSING_CONFIGURATION");
      return NextResponse.json({ status: "AI_UNAVAILABLE", reason: "MISSING_CONFIGURATION" });
    }

    console.log("[advisory] Gemini request started");
    
    // Add 15-second timeout via Promise.race
    const advisoryPromise = generateAdvisory(result.data);
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 15000)
    );
    
    const advisory = await Promise.race([advisoryPromise, timeoutPromise]);
    
    if (!advisory) {
      console.log("[advisory] FAILED stage=generation error=Advisory generation returned null");
      // Could be INVALID_RESPONSE or schema failure
      return NextResponse.json({ status: "AI_UNAVAILABLE", reason: "INVALID_RESPONSE" });
    }

    console.log("[advisory] response returned to client");
    return NextResponse.json({ status: "AVAILABLE", advisory });
  } catch (error: any) {
    const errMessage = error?.message || "";
    let safeReason = "UNKNOWN_ERROR";
    let status = 500;

    if (errMessage === "TIMEOUT") {
      safeReason = "TIMEOUT";
      status = 504;
    } else if (errMessage.includes("401") || errMessage.toLowerCase().includes("unauthorized") || errMessage.includes("API key not valid")) {
      safeReason = "INVALID_API_KEY";
    } else if (errMessage.includes("403")) {
      safeReason = "UNAUTHORIZED";
    } else if (errMessage.includes("404") || errMessage.toLowerCase().includes("model not found")) {
      safeReason = "MODEL_NOT_FOUND";
    } else if (errMessage.includes("429") || errMessage.toLowerCase().includes("quota")) {
      safeReason = "RATE_LIMITED";
    } else if (errMessage.includes("500") || errMessage.includes("503")) {
      safeReason = "PROVIDER_ERROR";
    }

    console.log(`[advisory] FAILED stage=route_error error=${errMessage} providerStatus=${safeReason}`);
    return NextResponse.json({ status: "AI_UNAVAILABLE", reason: safeReason }, { status });
  }
}
