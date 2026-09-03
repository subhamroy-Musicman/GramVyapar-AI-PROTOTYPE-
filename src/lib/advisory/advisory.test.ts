import { describe, it, expect, vi } from 'vitest';
import { buildAdvisoryInput } from './build-advisory-input';
import { generateAdvisory } from './generate-advisory';
import { SupportedLanguage, AdvisoryInput } from '../../domain/advisory/types';
import { AiProviderError, callGeminiStructured } from '../ai/gemini';
import { getSystemInstruction } from './prompt';
import { AdvisoryResultSchema } from '../../domain/advisory/schema';

// Mock the Gemini provider
vi.mock('../ai/gemini', () => ({
  callGeminiStructured: vi.fn(),
  AiProviderError: class AiProviderError extends Error {
    constructor(public type: string, message: string) {
      super(message);
    }
  }
}));

describe('Advisory Input Mapper', () => {
  it('preserves exact numerical values from authoritative engines', () => {
    const fakeData = { village: "V", district: "D", state: "S", businessIntent: "start", yearsLivestock: 2, animalCount: 5, animalType: "cow" } as any;
    const fakeFin = { 
      project: { projectCost: 405000 }, 
      funding: { effectiveOwnContribution: 100000, fundingGap: 305000 }, 
      financing: { category: "MUDRA_KISHORE" }, 
      economics: { annualMilkRevenue: 756000, annualOperatingExpenses: 301750, operatingSurplus: 454250 }, 
      repayment: { annualRepaymentBurden: 63058 }, 
      cashFlow: { postNewLoanRepaymentCash: 391192, netCashAfterExistingDebt: 391192 } 
    } as any;
    const fakeStress = { 
      scenario: { label: "Downside", milkYieldChangePct: -20, feedCostChangePct: 15 }, 
      stressed: { 
        economics: { annualMilkRevenue: 604800, annualOperatingExpenses: 342813, operatingSurplus: 261988 }, 
        repayment: { annualRepaymentBurden: 63058 }, 
        cashFlow: { postNewLoanRepaymentCash: 198929, netCashAfterExistingDebt: 198929 } 
      } 
    } as any;
    const fakeDecision = { status: "PROCEED", primaryReason: "Reason", reasonCodes: [], warnings: [] } as any;
    const fakeEvid = { 
      availability: "AVAILABLE", 
      location: { resolvedDisplayName: "Test" }, 
      radius5km: { providerAvailable: true, directDairySignals: [1], potentialSalesChannels: [1,2], supportInfrastructure: [] }, 
      radius10km: { providerAvailable: true, directDairySignals: [1], potentialSalesChannels: [1,2], supportInfrastructure: [] }, 
      dairySpecificConfidence: "HIGH", 
      competitiveSignal: "OBSERVED", 
      salesChannelSignal: "OBSERVED", 
      limitations: [] 
    } as any;
    
    const input = buildAdvisoryInput(fakeData, fakeFin, fakeStress, fakeDecision, fakeEvid, "en");
    
    // Domain mapper tests
    expect(input.financial.projectCost).toBe(405000); // 1
    expect(input.financial.ownContribution).toBe(100000); // 2
    expect(input.financial.fundingGap).toBe(305000); // 3
    expect(input.financial.financingCategory).toBe("MUDRA_KISHORE"); // 4
    expect(input.financial.annualRevenue).toBe(756000); // 5
    expect(input.financial.operatingSurplus).toBe(454250); // 6
    expect(input.financial.annualRepaymentBurden).toBe(63058); // 7
    expect(input.stress.operatingSurplus).toBe(261988); // 8
    expect(input.decision.status).toBe("PROCEED"); // 9
    expect(input.localEvidence.evidenceStatus).toBe("AVAILABLE"); // 10
  });
});

describe('Advisory Orchestrator', () => {
  it('handles provider timeout securely', async () => {
    vi.mocked(callGeminiStructured).mockRejectedValue(new AiProviderError("AI_TIMEOUT", "Timeout"));
    await expect(generateAdvisory({} as any)).rejects.toThrow("Timeout");
  });

  it('rejects malformed json by catching zod errors', async () => {
    vi.mocked(callGeminiStructured).mockResolvedValue({ summary: "Missing required fields" });
    await expect(generateAdvisory({} as any)).rejects.toThrow("Schema validation failed");
  });

  it('rejects if language mismatch', async () => {
    const fakeResponse = {
      language: "hi", summary: "summary is long enough", whyThisDecision: "whyThisDecision", biggestRisks: ["risk1"], stressTestInterpretation: "stress interpretation", localEvidenceContext: "local evidence", recommendedActions: ["action1"], verifyBeforeBorrowing: ["verify1"], disclaimer: "disclaimer disclaimer"
    };
    vi.mocked(callGeminiStructured).mockResolvedValue(fakeResponse);
    await expect(generateAdvisory({ language: "en" } as any)).rejects.toThrow("language did not match");
  });

  it('accepts valid structure in multiple languages', async () => {
    for (const lang of ["en", "hi", "bn", "mr", "ta"]) {
      const fakeResponse = {
        language: lang, summary: "summary is long enough", whyThisDecision: "whyThisDecision", biggestRisks: ["risk1"], stressTestInterpretation: "stress interpretation", localEvidenceContext: "local evidence", recommendedActions: ["action1"], verifyBeforeBorrowing: ["verify1"], disclaimer: "disclaimer disclaimer"
      };
      vi.mocked(callGeminiStructured).mockResolvedValue(fakeResponse);
      const res = await generateAdvisory({ language: lang } as any);
      expect(res.language).toBe(lang);
    }
  });
});

describe('Advisory Prompt Construction', () => {
  it('includes strict grounding rules', () => {
    const prompt = getSystemInstruction("en");
    expect(prompt).toContain("You are NOT the financial calculator");
    expect(prompt).toContain("Never recalculate");
    expect(prompt).toContain("PROCEED / MODIFY / HIGH_RISK");
    expect(prompt).toContain("Never invent market demand");
  });
});
