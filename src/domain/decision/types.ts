import { FinancingCategory } from "../../config/finance";

export type DecisionStatus = "PROCEED" | "MODIFY" | "HIGH_RISK";

export type DecisionReasonCode = 
  | "BASE_OPERATING_SURPLUS_NEGATIVE"
  | "BASE_POST_REPAYMENT_CASH_NEGATIVE"
  | "EXISTING_DEBT_PRESSURE"
  | "STRESS_POST_REPAYMENT_CASH_NEGATIVE"
  | "STRESS_EXISTING_DEBT_PRESSURE"
  | "STRESS_RESILIENCE_THIN"
  | "FINANCING_OUTSIDE_PROTOTYPE_RANGE"
  | "STRONG_BASE_ECONOMICS"
  | "STRESS_CASE_REMAINS_POSITIVE";

export type DecisionFactorImpact = "POSITIVE" | "NEGATIVE" | "WARNING" | "NEUTRAL";

export interface DecisionFactor {
  label: string;
  value: number;
  impact: DecisionFactorImpact;
}

export type DecisionWarning = string;

export interface DecisionResult {
  status: DecisionStatus;
  primaryReason: DecisionReasonCode;
  reasonCodes: DecisionReasonCode[];
  keyFactors: DecisionFactor[];
  warnings: DecisionWarning[];
  metricsUsed: {
    baseOperatingSurplus: number;
    basePostRepaymentCash: number;
    baseNetCashAfterExistingDebt: number;

    stressOperatingSurplus: number;
    stressPostRepaymentCash: number;
    stressNetCashAfterExistingDebt: number;

    fundingGap: number;
    financingCategory: FinancingCategory;
  };
}
