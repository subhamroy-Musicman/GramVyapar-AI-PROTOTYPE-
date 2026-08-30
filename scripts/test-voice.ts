import { loadEnvConfig } from '@next/env';
import { generateAdvisoryQuestion } from '../src/lib/advisory';
import { AdvisoryRequest } from '../src/app/api/advisory/route';

loadEnvConfig(process.cwd());

async function run() {
  const assessment: AdvisoryRequest = {
    business: { type: "Dairy Farming", location: "Shirpur, Pune", herdSize: 5 },
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
    language: "hi" // Hindi
  };

  const question = "मेरे लिए यह निर्णय क्यों आया?";
  
  console.log(`Asking: ${question}`);
  const answer = await generateAdvisoryQuestion(assessment, question);
  console.log(`Answer:\n${answer}`);
}

run();
