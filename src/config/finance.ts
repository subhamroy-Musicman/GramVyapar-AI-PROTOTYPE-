export type SchemeId =
  | "MICRO_FINANCE_SCHEME"
  | "TERM_LOAN_SCHEME"
  | "OUTSIDE_SUPPORTED_SCHEME_RANGE";

export interface FinancingScheme {
  id: SchemeId;
  projectCostMin: number;
  projectCostMax: number;
  financingPercentage: number;
  maxLoan: number;
  annualInterestRate: number;
  tenureYears: number;
  moratoriumMonths: number;
  repaymentFrequency: "QUARTERLY";
}

export const SCHEMES: Record<Exclude<SchemeId, "OUTSIDE_SUPPORTED_SCHEME_RANGE">, FinancingScheme> = {
  MICRO_FINANCE_SCHEME: {
    id: "MICRO_FINANCE_SCHEME",
    projectCostMin: 0,
    projectCostMax: 140000,
    financingPercentage: 0.90,
    maxLoan: 125000,
    annualInterestRate: 0.065,
    tenureYears: 3,
    moratoriumMonths: 3,
    repaymentFrequency: "QUARTERLY"
  },
  TERM_LOAN_SCHEME: {
    id: "TERM_LOAN_SCHEME",
    projectCostMin: 140000,
    projectCostMax: 5000000,
    financingPercentage: 0.90,
    maxLoan: 4500000,
    annualInterestRate: 0.08,
    tenureYears: 7,
    moratoriumMonths: 6,
    repaymentFrequency: "QUARTERLY"
  }
};

export type FinancingCategory = SchemeId;

export const FINANCE_CONFIG = {
  periodsPerYear: 4,
};
