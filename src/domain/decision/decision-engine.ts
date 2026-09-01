import { StressAssessment } from "../stress/types";
import { 
  DecisionResult, 
  DecisionStatus, 
  DecisionReasonCode, 
  DecisionFactor, 
  DecisionWarning 
} from "./types";
import { DECISION_CONFIG } from "../../config/decision";

export function evaluateDecision(stressAssessment: StressAssessment): DecisionResult {
  const base = stressAssessment.base;
  const stress = stressAssessment.stressed;

  const metricsUsed = {
    baseOperatingSurplus: base.economics.operatingSurplus,
    basePostRepaymentCash: base.cashFlow.postNewLoanRepaymentCash,
    baseNetCashAfterExistingDebt: base.cashFlow.netCashAfterExistingDebt,
    stressOperatingSurplus: stress.economics.operatingSurplus,
    stressPostRepaymentCash: stress.cashFlow.postNewLoanRepaymentCash,
    stressNetCashAfterExistingDebt: stress.cashFlow.netCashAfterExistingDebt,
    fundingGap: base.funding.fundingGap,
    financingCategory: base.financing.category
  };

  const reasonCodes: DecisionReasonCode[] = [];
  const keyFactors: DecisionFactor[] = [];
  const warnings: DecisionWarning[] = [];
  
  let status: DecisionStatus = "PROCEED";
  let primaryReason: DecisionReasonCode = "STRONG_BASE_ECONOMICS";

  // --- A. HIGH_RISK (Base Case Unsustainable) ---
  
  if (metricsUsed.baseOperatingSurplus <= 0) {
    status = "HIGH_RISK";
    primaryReason = "BASE_OPERATING_SURPLUS_NEGATIVE";
    reasonCodes.push("BASE_OPERATING_SURPLUS_NEGATIVE");
    keyFactors.push({ label: "Base Operating Surplus", value: metricsUsed.baseOperatingSurplus, impact: "NEGATIVE" });
  } else {
    keyFactors.push({ label: "Base Operating Surplus", value: metricsUsed.baseOperatingSurplus, impact: "POSITIVE" });
  }

  if (metricsUsed.basePostRepaymentCash <= 0 && status !== "HIGH_RISK") {
    status = "HIGH_RISK";
    primaryReason = "BASE_POST_REPAYMENT_CASH_NEGATIVE";
    reasonCodes.push("BASE_POST_REPAYMENT_CASH_NEGATIVE");
    keyFactors.push({ label: "Base Post-Repayment Cash", value: metricsUsed.basePostRepaymentCash, impact: "NEGATIVE" });
  } else if (metricsUsed.basePostRepaymentCash > 0) {
    keyFactors.push({ label: "Base Post-Repayment Cash", value: metricsUsed.basePostRepaymentCash, impact: "POSITIVE" });
  }

  if (metricsUsed.baseNetCashAfterExistingDebt <= 0 && status !== "HIGH_RISK") {
    status = "HIGH_RISK";
    primaryReason = "EXISTING_DEBT_PRESSURE";
    reasonCodes.push("EXISTING_DEBT_PRESSURE");
    warnings.push("Existing debt materially reduces business resilience to negative cash flow.");
    keyFactors.push({ label: "Net Cash After Existing Debt", value: metricsUsed.baseNetCashAfterExistingDebt, impact: "NEGATIVE" });
  } else if (metricsUsed.baseNetCashAfterExistingDebt > 0) {
    keyFactors.push({ label: "Net Cash After Existing Debt", value: metricsUsed.baseNetCashAfterExistingDebt, impact: "POSITIVE" });
  }

  // Early exit if the base business model fails.
  if (status === "HIGH_RISK") {
    return { status, primaryReason, reasonCodes, keyFactors, warnings, metricsUsed };
  }

  // --- B. MODIFY (Weak Resilience or Outside Range) ---

  // 1. Outside Prototype Range
  if (metricsUsed.financingCategory === "OUTSIDE_PROTOTYPE_RANGE") {
    // Economics are positive (we passed the HIGH_RISK checks), but financing is too large
    status = "MODIFY";
    primaryReason = "FINANCING_OUTSIDE_PROTOTYPE_RANGE";
    reasonCodes.push("FINANCING_OUTSIDE_PROTOTYPE_RANGE");
    warnings.push("Financing requirement exceeds prototype routing range.");
    keyFactors.push({ label: "Funding Gap", value: metricsUsed.fundingGap, impact: "WARNING" });
  }

  // 2. Stress Post Repayment Cash Negative
  if (metricsUsed.stressPostRepaymentCash <= 0) {
    if (status === "PROCEED") {
      status = "MODIFY";
      primaryReason = "STRESS_POST_REPAYMENT_CASH_NEGATIVE";
    }
    reasonCodes.push("STRESS_POST_REPAYMENT_CASH_NEGATIVE");
    keyFactors.push({ label: "Stress Post-Repayment Cash", value: metricsUsed.stressPostRepaymentCash, impact: "NEGATIVE" });
    warnings.push("Stress scenario produces negative cash flow after new loan repayment.");
  } else {
    keyFactors.push({ label: "Stress Post-Repayment Cash", value: metricsUsed.stressPostRepaymentCash, impact: "POSITIVE" });
  }

  // 3. Stress Existing Debt Pressure
  if (metricsUsed.stressPostRepaymentCash > 0 && metricsUsed.stressNetCashAfterExistingDebt <= 0) {
    if (status === "PROCEED") {
      status = "MODIFY";
      primaryReason = "STRESS_EXISTING_DEBT_PRESSURE";
    }
    reasonCodes.push("STRESS_EXISTING_DEBT_PRESSURE");
    keyFactors.push({ label: "Stress Net Cash After Debt", value: metricsUsed.stressNetCashAfterExistingDebt, impact: "NEGATIVE" });
    warnings.push("Stress scenario produces negative cash flow after existing debt obligations.");
  } else if (metricsUsed.stressNetCashAfterExistingDebt > 0) {
    // 4. Resilience Buffer is technically positive but materially thin
    if (metricsUsed.stressNetCashAfterExistingDebt < DECISION_CONFIG.minimumStressCashBuffer) {
      if (status === "PROCEED") {
        status = "MODIFY";
        primaryReason = "STRESS_RESILIENCE_THIN";
      }
      reasonCodes.push("STRESS_RESILIENCE_THIN");
      keyFactors.push({ label: "Stress Net Cash After Debt", value: metricsUsed.stressNetCashAfterExistingDebt, impact: "WARNING" });
      warnings.push("Stress case leaves limited cash buffer.");
    } else {
      keyFactors.push({ label: "Stress Net Cash After Debt", value: metricsUsed.stressNetCashAfterExistingDebt, impact: "POSITIVE" });
    }
  }

  // --- C. PROCEED ---
  if (status === "PROCEED") {
    reasonCodes.push("STRONG_BASE_ECONOMICS");
    reasonCodes.push("STRESS_CASE_REMAINS_POSITIVE");
  } else {
    // If we dropped to MODIFY but stress cash is strictly positive
    if (metricsUsed.stressNetCashAfterExistingDebt > 0) {
      reasonCodes.push("STRESS_CASE_REMAINS_POSITIVE");
    }
  }

  return {
    status,
    primaryReason,
    reasonCodes,
    keyFactors,
    warnings,
    metricsUsed
  };
}
