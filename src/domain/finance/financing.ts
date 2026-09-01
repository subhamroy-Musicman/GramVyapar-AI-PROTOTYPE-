import { FINANCE_CONFIG } from "../../config/finance";
import { FinancingResult } from "./types";

export function routeFinancing(fundingGap: number): FinancingResult {
  if (fundingGap <= 0) {
    return {
      category: "SELF_FUNDED",
      fundingRequirement: fundingGap,
      withinPrototypeRange: true,
      reasonCode: "Funding requirement is zero. Project is entirely self-funded."
    };
  }
  
  if (fundingGap <= FINANCE_CONFIG.thresholds.microLoan) {
    return {
      category: "MICRO_LOAN",
      fundingRequirement: fundingGap,
      withinPrototypeRange: true,
      reasonCode: `Funding requirement of ₹${fundingGap} falls within the prototype Micro Loan range (<= ₹1.5L).`
    };
  }
  
  if (fundingGap <= FINANCE_CONFIG.thresholds.smallEnterprise) {
    return {
      category: "SMALL_ENTERPRISE_FINANCE",
      fundingRequirement: fundingGap,
      withinPrototypeRange: true,
      reasonCode: `Funding requirement of ₹${fundingGap} falls within the prototype Small Enterprise Finance range (<= ₹5L).`
    };
  }
  
  if (fundingGap <= FINANCE_CONFIG.thresholds.termLoan) {
    return {
      category: "TERM_LOAN",
      fundingRequirement: fundingGap,
      withinPrototypeRange: true,
      reasonCode: `Funding requirement of ₹${fundingGap} falls within the prototype Term Loan range (<= ₹10L).`
    };
  }
  
  return {
    category: "OUTSIDE_PROTOTYPE_RANGE",
    fundingRequirement: fundingGap,
    withinPrototypeRange: false,
    reasonCode: `Funding requirement of ₹${fundingGap} exceeds prototype term loan limit (> ₹10L).`
  };
}
