import { SCHEMES, SchemeId } from "../../config/finance";
import { FinancingResult } from "./types";

export function routeFinancing(projectCost: number, fundingGap: number): FinancingResult {
  if (projectCost <= SCHEMES.MICRO_FINANCE_SCHEME.projectCostMax) {
    const maxLoanAllowed = Math.min(
      projectCost * SCHEMES.MICRO_FINANCE_SCHEME.financingPercentage, 
      SCHEMES.MICRO_FINANCE_SCHEME.maxLoan
    );
    return {
      category: "MICRO_FINANCE_SCHEME",
      fundingRequirement: fundingGap,
      withinPrototypeRange: true,
      schemeMaximumLoan: maxLoanAllowed,
      reasonCode: `Project Cost of ₹${projectCost} routes to Micro Finance Scheme.`
    };
  }

  if (projectCost <= SCHEMES.TERM_LOAN_SCHEME.projectCostMax) {
    const maxLoanAllowed = Math.min(
      projectCost * SCHEMES.TERM_LOAN_SCHEME.financingPercentage,
      SCHEMES.TERM_LOAN_SCHEME.maxLoan
    );
    return {
      category: "TERM_LOAN_SCHEME",
      fundingRequirement: fundingGap,
      withinPrototypeRange: true,
      schemeMaximumLoan: maxLoanAllowed,
      reasonCode: `Project Cost of ₹${projectCost} routes to Term Loan Scheme.`
    };
  }

  return {
    category: "OUTSIDE_SUPPORTED_SCHEME_RANGE",
    fundingRequirement: fundingGap,
    withinPrototypeRange: false,
    schemeMaximumLoan: 0,
    reasonCode: `Project Cost of ₹${projectCost} exceeds the supported Term Loan Scheme range (> ₹50L).`
  };
}
