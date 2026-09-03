import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAdvisory } from '@/lib/advisory/generate-advisory';
import { AiProviderError } from '@/lib/ai/gemini';

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

    const result = await generateAdvisory(parsed.data as unknown as import('@/domain/advisory/types').AdvisoryInput);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API Advisory] Error:', error);
    
    let message = "AI advisory is temporarily unavailable.";
    let statusCode = 500;

    if (error instanceof AiProviderError) {
      if (error.type === 'AI_RATE_LIMITED') {
        statusCode = 429;
        message = "AI advisory is temporarily rate-limited.";
      } else if (error.type === 'AI_AUTH_ERROR') {
        statusCode = 500; // Internal configuration error, do not expose as 401/403 to client
        message = "AI advisory is misconfigured.";
      } else if (error.type === 'AI_INVALID_RESPONSE') {
        message = "AI advisory generated an invalid response.";
      }
    }

    return NextResponse.json(
      { status: "UNAVAILABLE", message }, 
      { status: statusCode }
    );
  }
}
