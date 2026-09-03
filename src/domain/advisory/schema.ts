import { z } from "zod";

export const AdvisoryResultSchema = z.object({
  language: z.enum(["en", "hi", "bn", "mr", "ta"]),
  summary: z.string().min(5),
  whyThisDecision: z.string().min(5),
  biggestRisks: z.array(z.string().min(5)).min(1).max(4),
  stressTestInterpretation: z.string().min(5),
  localEvidenceContext: z.string().min(5),
  recommendedActions: z.array(z.string().min(5)).min(1).max(5),
  verifyBeforeBorrowing: z.array(z.string().min(5)).min(1).max(5),
  disclaimer: z.string().min(10)
});
