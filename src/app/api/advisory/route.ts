import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAdvisory } from '@/lib/advisory/generate-advisory';
import { AiProviderError } from '@/lib/ai/gemini';

export const maxDuration = 60;

const advisoryRequestSchema = z.object({
  language: z.enum(["en", "hi", "bn", "mr", "ta"]),
  entrepreneur: z.any(),
  business: z.any(),
  financial: z.any(),
  stress: z.any(),
  decision: z.any(),
  localEvidence: z.any()
}); // Minimal validation to protect against completely malformed POSTs, relying on the internal caller (Step 4) to provide the correct DTO

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = advisoryRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { status: "UNAVAILABLE", message: "Invalid advisory input format." }, 
        { status: 400 }
      );
    }

    const payload = parsed.data as unknown as import('@/domain/advisory/types').AdvisoryInput;
    let attempt = 1;
    const maxAttempts = 3;

    while (attempt <= maxAttempts) {
      try {
        const result = await generateAdvisory(payload);
        return NextResponse.json(result);
      } catch (error: any) {
        if (error instanceof AiProviderError) {
          const isTransient = error.type === 'AI_RATE_LIMITED' || 
                              error.type === 'AI_PROVIDER_UNAVAILABLE' || 
                              error.type === 'AI_TIMEOUT' || 
                              error.type === 'UNKNOWN_ERROR';
                              
          if (isTransient && attempt < maxAttempts) {
            console.log(`[API Advisory] Transient error (attempt ${attempt}). Retrying...`);
            await new Promise(res => setTimeout(res, attempt * 1000));
            attempt++;
            continue;
          }
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('[API Advisory] Error:', error);
    
    let message = "AI advisory is temporarily unavailable.";
    let statusCode = 500;
    let category = "SERVER_ERROR";

    if (error instanceof AiProviderError) {
      if (error.type === 'AI_RATE_LIMITED') {
        statusCode = 429;
        category = "RATE_LIMIT";
        message = "AI service is temporarily busy. Please retry shortly.";
      } else if (error.type === 'AI_AUTH_ERROR') {
        statusCode = 500; // Internal configuration error, do not expose as 401/403 to client
        category = "AUTH_ERROR";
        message = "AI advisory is temporarily unavailable.";
      } else if (error.type === 'AI_INVALID_RESPONSE') {
        statusCode = 500;
        category = "INVALID_RESPONSE";
        message = "AI advisory generated an invalid response.";
      } else if (error.type === 'AI_TIMEOUT') {
        statusCode = 504;
        category = "AI_TIMEOUT";
        message = "Advisory generation took too long. Please retry.";
      } else if (error.type === 'AI_PROVIDER_UNAVAILABLE') {
        statusCode = 503;
        category = "PROVIDER_UNAVAILABLE";
        message = "AI service is temporarily unavailable. Please retry shortly.";
      }
    }

    return NextResponse.json(
      { status: "UNAVAILABLE", category, message }, 
      { status: statusCode }
    );
  }
}
