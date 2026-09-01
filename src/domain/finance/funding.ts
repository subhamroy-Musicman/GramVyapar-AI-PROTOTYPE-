import { FundingResult } from "./types";

export function calculateFundingStructure(availableCapital: number, projectCost: number): FundingResult {
  const effectiveOwnContribution = Math.min(availableCapital, projectCost);
  const fundingGap = Math.max(0, projectCost - effectiveOwnContribution);

  return {
    availableCapital,
    effectiveOwnContribution,
    fundingGap
  };
}
