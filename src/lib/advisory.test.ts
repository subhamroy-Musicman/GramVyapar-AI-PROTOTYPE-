/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAdvisory } from './advisory';
import { GoogleGenAI } from '@google/genai';
import { AdvisoryRequest } from '@/app/api/advisory/route';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent
      };
    }
  };
});

describe('AI Advisory Layer', () => {
  const validRequest: AdvisoryRequest = {
    business: { type: "Dairy Farming", location: "Test Village", herdSize: 5 },
    decision: "PROCEED",
    financial: {
      availableCapital: 50000, projectCost: 500000, fundingGap: 450000,
      indicativeLoan: 450000, annualRevenue: 100000, annualOperatingCost: 50000,
      operatingSurplus: 50000, repaymentBurden: 20000, postRepaymentCash: 30000
    },
    stressTest: {
      scenario: "20% drop", stressedRevenue: 80000, stressedOperatingCost: 50000,
      stressedPostRepaymentCash: 10000
    },
    localEvidence: {
      marketReach5km: 15,
      marketReach10km: 50,
      directDairySignals5km: 2,
      directDairySignals10km: 5,
      competitorConfidence: "high",
      weatherContext: "Heat stress risk",
      availabilityState: "AVAILABLE"
    },
    language: "en"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
    
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        summary: "Valid summary",
        whyThisDecision: "Valid reason",
        strongestFactor: "Valid factor",
        biggestRisk: "Valid risk",
        stressExplanation: "Valid stress",
        localMarketExplanation: "Valid market",
        recommendedActions: ["Action 1"],
        evidenceCaveat: "Valid caveat"
      })
    });
  });

  it('accepts valid structured assessment and returns validated JSON', async () => {
    const result = await generateAdvisory(validRequest);
    expect(result).not.toBeNull();
    expect(result?.summary).toBe("Valid summary");
  });

  it('handles malformed Gemini response safely', async () => {
    mockGenerateContent.mockResolvedValue({
      text: "{ invalid json"
    });
    const result = await generateAdvisory(validRequest);
    expect(result).toBeNull();
  });

  it('handles schema validation failure safely', async () => {
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({ summary: "Missing other required fields" })
    });
    const result = await generateAdvisory(validRequest);
    expect(result).toBeNull();
  });

  it('handles provider failure / timeout safely', async () => {
    mockGenerateContent.mockRejectedValue(new Error("Network timeout"));
    const result = await generateAdvisory(validRequest);
    expect(result).toBeNull();
  });

  it('does not send request if API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const result = await generateAdvisory(validRequest);
    expect(result).toBeNull();
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('passes strict grounding rules in system instruction', async () => {
    await generateAdvisory(validRequest);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    
    expect(callArgs.config.systemInstruction).toContain("Never recalculate them.");
    expect(callArgs.config.systemInstruction).toContain("Never change the decision.");
    expect(callArgs.config.systemInstruction).toContain("mapped market/activity signals");
    expect(callArgs.config.systemInstruction).toContain("mapped dairy-related signals");
    expect(callArgs.config.systemInstruction).toContain("Live local mapping evidence could not be retrieved");
  });
});
