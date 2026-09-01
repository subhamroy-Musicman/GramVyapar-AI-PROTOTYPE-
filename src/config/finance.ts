export type FinancingCategory =
  | "SELF_FUNDED"
  | "MICRO_LOAN"
  | "SMALL_ENTERPRISE_FINANCE"
  | "TERM_LOAN"
  | "OUTSIDE_PROTOTYPE_RANGE";

export const FINANCE_CONFIG = {
  annualInterestRate: 0.08,
  tenureYears: 7,
  moratoriumMonths: 6,
  repaymentFrequency: "QUARTERLY" as const,
  periodsPerYear: 4,
  
  thresholds: {
    microLoan: 150000,
    smallEnterprise: 500000,
    termLoan: 1000000,
  }
};
