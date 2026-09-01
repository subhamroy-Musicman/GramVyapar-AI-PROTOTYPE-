import { FinancialAssessment } from "../finance/types";

export interface StressScenario {
  id: string;
  label: string;
  milkYieldChangePct: number;
  feedCostChangePct: number;
}

export interface StressComparison {
  revenueChange: number;
  operatingExpenseChange: number;
  operatingSurplusChange: number;
  postRepaymentCashChange: number;
  netCashAfterExistingDebtChange: number;
}

export interface StressAssessment {
  scenario: StressScenario;
  base: FinancialAssessment;
  stressed: FinancialAssessment;
  comparison: StressComparison;
}
