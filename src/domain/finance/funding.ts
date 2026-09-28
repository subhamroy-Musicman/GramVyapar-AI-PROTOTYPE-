import { FundingResult } from "./types";

export function calculateFundingStructure(availableCapital: number, projectCost: number): FundingResult {
  const effectiveOwnContribution = Math.min(availableCapital, projectCost);
  const fundingGap = Math.max(0, projectCost - effectiveOwnContribution);

  const maximumFeasibleProjectCapacity = availableCapital / 0.10;
  const maximumSchemeFinancingCapacity = maximumFeasibleProjectCapacity * 0.90;

  return {
    availableCapital,
    effectiveOwnContribution,
    fundingGap,
    maximumFeasibleProjectCapacity,
    maximumSchemeFinancingCapacity
  };
}
