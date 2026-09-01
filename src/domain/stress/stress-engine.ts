import { DairyPlanInputs } from "../dairy/types";
import { EntrepreneurInputs, calculateFinancialAssessment } from "../finance/financial-assessment";
import { StressAssessment, StressScenario } from "./types";
import { FinancialAssessment } from "../finance/types";

export function calculateStressAssessment(
  entrepreneur: EntrepreneurInputs,
  dairyPlan: DairyPlanInputs,
  scenario: StressScenario
): StressAssessment {
  // Deep clone or shallow copy inputs to prevent mutation
  const baseDairyPlan = { ...dairyPlan };
  const baseEntrepreneur = { ...entrepreneur };

  // Calculate base case
  const baseAssessment: FinancialAssessment = calculateFinancialAssessment(baseEntrepreneur, baseDairyPlan);

  // Create stressed inputs
  const stressedDairyPlan = {
    ...dairyPlan,
    milkYieldPerDay: dairyPlan.milkYieldPerDay * (1 + scenario.milkYieldChangePct),
    feedCostPerDay: dairyPlan.feedCostPerDay * (1 + scenario.feedCostChangePct)
  };
  const stressedEntrepreneur = { ...entrepreneur };

  // Calculate stressed case using the exact same pure pipeline
  const stressedAssessment: FinancialAssessment = calculateFinancialAssessment(stressedEntrepreneur, stressedDairyPlan);

  // Compare
  const comparison = {
    revenueChange: stressedAssessment.economics.annualMilkRevenue - baseAssessment.economics.annualMilkRevenue,
    operatingExpenseChange: stressedAssessment.economics.annualOperatingExpenses - baseAssessment.economics.annualOperatingExpenses,
    operatingSurplusChange: stressedAssessment.economics.operatingSurplus - baseAssessment.economics.operatingSurplus,
    postRepaymentCashChange: stressedAssessment.cashFlow.postNewLoanRepaymentCash - baseAssessment.cashFlow.postNewLoanRepaymentCash,
    netCashAfterExistingDebtChange: stressedAssessment.cashFlow.netCashAfterExistingDebt - baseAssessment.cashFlow.netCashAfterExistingDebt
  };

  return {
    scenario,
    base: baseAssessment,
    stressed: stressedAssessment,
    comparison
  };
}
