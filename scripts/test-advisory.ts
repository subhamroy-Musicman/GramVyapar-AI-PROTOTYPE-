import { generateAdvisory } from '../src/lib/advisory';
import { AdvisoryRequest } from '../src/app/api/advisory/route';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const testRequest: AdvisoryRequest = {
  business: {
    type: "Dairy Farming",
    location: "Bally, Howrah, West Bengal",
    herdSize: 10
  },
  decision: "PROCEED",
  financial: {
    availableCapital: 100000,
    projectCost: 1000000,
    fundingGap: 900000,
    indicativeLoan: 900000,
    annualRevenue: 540000,
    annualOperatingCost: 180000,
    operatingSurplus: 360000,
    repaymentBurden: 320000,
    postRepaymentCash: 40000
  },
  stressTest: {
    scenario: "20% drop",
    stressedRevenue: 432000,
    stressedOperatingCost: 180000,
    stressedPostRepaymentCash: 10000
  },
  localEvidence: {
    marketReach5km: 10,
    marketReach10km: 20,
    directDairySignals5km: 2,
    directDairySignals10km: 5,
    competitorConfidence: "high",
    weatherContext: "Clear",
    availabilityState: "AVAILABLE"
  },
  language: "en"
};

async function run() {
  console.log("Requesting advisory...");
  const res = await generateAdvisory(testRequest);
  console.log(JSON.stringify(res, null, 2));
}

run();
