
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildEvidenceResult } from '@/lib/data/evidence';

const evidenceRequestSchema = z.object({
  villageTown: z.string().min(1),
  district: z.string().min(1),
  state: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = evidenceRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid location parameters' }, { status: 400 });
    }

    const { villageTown, district, state } = parsed.data;
    const result = await buildEvidenceResult(villageTown, district, state);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API Evidence] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
