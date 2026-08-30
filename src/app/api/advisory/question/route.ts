import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateAdvisoryQuestion } from '@/lib/advisory';
import { AdvisoryRequestSchema } from '../route';

const QuestionRequestSchema = AdvisoryRequestSchema.extend({
  question: z.string().min(1, "Question is required")
});

export type QuestionRequest = z.infer<typeof QuestionRequestSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = QuestionRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        status: "INVALID_REQUEST", 
        error: result.error.format() 
      }, { status: 400 });
    }

    const { question, ...assessment } = result.data;
    
    const promise = generateAdvisoryQuestion(assessment, question);
    const timeout = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    const answer = await Promise.race([promise, timeout]);
    
    if (!answer) {
      return NextResponse.json({ status: "AI_UNAVAILABLE" });
    }

    return NextResponse.json({ 
      status: "AVAILABLE",
      answer 
    });

  } catch (err: any) {
    console.error("[advisory-question] FAILED", err.message);
    return NextResponse.json({ status: "AI_UNAVAILABLE" });
  }
}
