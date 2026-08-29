"use server";

import { gatherLiveEvidence } from "@/lib/data/evidence";
import { LiveEvidence } from "@/types/evidence";

export async function getEvidenceAction(village: string, district: string, state: string): Promise<LiveEvidence> {
  return gatherLiveEvidence(village, district, state);
}
