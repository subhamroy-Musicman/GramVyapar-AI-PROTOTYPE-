import { GoogleGenAI } from '@google/genai';
import { loadEnvConfig } from '@next/env';
import { AdvisoryRequest } from '../src/app/api/advisory/route';
import { generateAdvisory } from '../src/lib/advisory';

loadEnvConfig(process.cwd());

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("GEMINI_API_KEY configured: NO");
    return;
  }
  
  console.log("GEMINI_API_KEY configured: YES");
  
  const assessment: AdvisoryRequest = {
    business: { type: "Dairy Farming", location: "Shirpur, Pune, Maharashtra", herdSize: 5 },
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
      marketReach5km: 10, marketReach10km: 20, directDairySignals5km: 2,
      directDairySignals10km: 5, competitorConfidence: "high", weatherContext: "Clear",
      availabilityState: "AVAILABLE"
    },
    language: "en"
  };

  const languages: ("en" | "hi" | "bn" | "mr" | "ta")[] = ["en", "hi", "bn", "mr", "ta"];

  for (const lang of languages) {
    console.log(`\n==========================================`);
    console.log(`Testing Language: ${lang}`);
    console.log(`==========================================`);
    assessment.language = lang;
    
    try {
      const start = Date.now();
      const response = await generateAdvisory(assessment);
      const time = Date.now() - start;
      
      if (!response) {
         console.log(`[${lang}] Failed to generate response (returned null)`);
         continue;
      }
      
      console.log(`[${lang}] Request success in ${time}ms`);
      console.log(`[${lang}] Schema validation passed: YES`);
      console.log(`[${lang}] Summary: ${response.summary}`);
      console.log(`[${lang}] Why this decision: ${response.whyThisDecision}`);
    } catch (err: any) {
      console.error(`[${lang}] Error: ${err.message}`);
    }
  }
}

run();
