import { FinancialAssessment } from "./types";
import { StressAssessment } from "../stress/types";
import { DairyPlanInputs } from "../dairy/types";

export type PricingReferenceStatus =
  | "AVAILABLE"
  | "USER_PROVIDED"
  | "DATA_UNAVAILABLE";

export type PricePosition =
  | "BELOW_OPERATING_BREAK_EVEN"
  | "COVERS_OPERATIONS_NOT_DEBT"
  | "COVERS_BASE_DEBT_SERVICE"
  | "COVERS_STRESS_DEBT_SERVICE";

export interface MarketPriceReference {
  status: PricingReferenceStatus;
  pricePerUnit: number | null;
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
  source: string | null;
  effectiveDate?: string | null;
  message: string;
}

export interface PurchasingPowerReference {
  status: "AVAILABLE" | "DATA_UNAVAILABLE";
  metric: string | null;
  value: number | null;
  source: string | null;
  message: string;
}

export interface PricingIntelligenceResult {
  productUnit: "LITRE";
  userAssumedPricePerUnit: number;
  baseAnnualProductionUnits: number;
  operatingBreakEvenPricePerUnit: number;
  debtServiceBreakEvenPricePerUnit: number;
  stressAnnualProductionUnits: number;
  stressDebtServiceBreakEvenPricePerUnit: number | null;
  pricePosition: PricePosition;
  localMarketReference: MarketPriceReference;
  purchasingPowerReference: PurchasingPowerReference;
  limitations: string[];
  validationActions: string[];
  summary: string;
}

export function calculatePricingIntelligence(
  assessment: FinancialAssessment,
  stress: StressAssessment,
  inputs: DairyPlanInputs
): PricingIntelligenceResult | "INSUFFICIENT_DATA" {
  const baseAnnualProductionUnits = assessment.economics.annualMilkProduction;
  if (baseAnnualProductionUnits <= 0) {
    return "INSUFFICIENT_DATA";
  }

  const userAssumedPricePerUnit = inputs.milkPrice;
  const annualOperatingExpenses = assessment.economics.annualOperatingExpenses;
  const annualRepaymentBurden = assessment.repayment.annualRepaymentBurden;

  const operatingBreakEvenPricePerUnit = annualOperatingExpenses / baseAnnualProductionUnits;
  
  // Notice we must also check existing debt if it's considered in the final cashflow
  // The repayment burden includes the new loan. We also add existing debt burden.
  const totalDebtBurden = annualRepaymentBurden + assessment.debt.annualExistingDebtBurden;
  const debtServiceBreakEvenPricePerUnit = (annualOperatingExpenses + totalDebtBurden) / baseAnnualProductionUnits;

  const stressAnnualProductionUnits = stress.stressed.economics.annualMilkProduction;
  let stressDebtServiceBreakEvenPricePerUnit: number | null = null;

  if (stressAnnualProductionUnits > 0) {
    const stressOperatingExpenses = stress.stressed.economics.annualOperatingExpenses;
    const stressTotalDebtBurden = stress.stressed.repayment.annualRepaymentBurden + stress.stressed.debt.annualExistingDebtBurden;
    stressDebtServiceBreakEvenPricePerUnit = (stressOperatingExpenses + stressTotalDebtBurden) / stressAnnualProductionUnits;
  }

  let pricePosition: PricePosition;
  
  if (userAssumedPricePerUnit < operatingBreakEvenPricePerUnit) {
    pricePosition = "BELOW_OPERATING_BREAK_EVEN";
  } else if (userAssumedPricePerUnit < debtServiceBreakEvenPricePerUnit) {
    pricePosition = "COVERS_OPERATIONS_NOT_DEBT";
  } else if (stressDebtServiceBreakEvenPricePerUnit !== null && userAssumedPricePerUnit < stressDebtServiceBreakEvenPricePerUnit) {
    pricePosition = "COVERS_BASE_DEBT_SERVICE";
  } else {
    pricePosition = "COVERS_STRESS_DEBT_SERVICE";
  }

  let summary = "";
  if (pricePosition === "BELOW_OPERATING_BREAK_EVEN") {
    summary = "The current entered price is insufficient to cover the modelled business and debt obligations.";
  } else if (pricePosition === "COVERS_OPERATIONS_NOT_DEBT") {
    summary = "The entered selling price covers projected operating costs but does not fully cover the modelled debt-service requirement.";
  } else if (pricePosition === "COVERS_BASE_DEBT_SERVICE") {
    summary = "The entered selling price covers the base-case debt-service requirement but not the predefined stress-case break-even level.";
  } else {
    summary = "The entered selling price is above the modelled base and stress-case break-even requirements, but local buyer acceptance has not been verified.";
  }

  const limitations = [
    "User-entered selling price is an assumption.",
    "Calculated break-even prices depend on the entered production and cost assumptions.",
    "The stress price uses the predefined combined stress scenario.",
    "A verified local milk-price source is currently unavailable.",
    "Regional purchasing-power data is currently unavailable.",
    "Break-even price does not predict what buyers will pay.",
    "Pricing calculations do not model demand elasticity.",
    "Pricing calculations do not guarantee profitability."
  ];

  const validationActions = [
    "Collect current purchase-price quotations from at least 3 nearby buyers, retailers, cooperatives or collection points.",
    "Record whether the quoted price is procurement, wholesale or retail price.",
    "Compare those quotes with the calculated debt-service and stress-case break-even prices.",
    "Do not finalize the loan using only the user-entered price assumption."
  ];
  
  if (pricePosition === "BELOW_OPERATING_BREAK_EVEN") {
    validationActions.unshift("Recheck cost assumptions, project scale, or whether local buyers will accept a price above the calculated operating break-even.");
  } else if (pricePosition === "COVERS_OPERATIONS_NOT_DEBT") {
    validationActions.unshift("Recheck cost assumptions, project scale, or whether local buyers will accept a price above the calculated debt-service break-even.");
  } else if (pricePosition === "COVERS_BASE_DEBT_SERVICE") {
    validationActions.unshift("Validate whether local buyers will accept at least the stress-case break-even level, or reduce costs/debt before investment.");
  } else if (pricePosition === "COVERS_STRESS_DEBT_SERVICE") {
    validationActions.unshift("The business model clears the current modelled break-even level. Verify that nearby buyers actually pay at least this price before borrowing.");
  }

  const localMarketReference: MarketPriceReference = {
    status: "DATA_UNAVAILABLE",
    pricePerUnit: null,
    source: null,
    message: "A verified local milk-price reference is not currently available from the prototype's data sources."
  };

  const purchasingPowerReference: PurchasingPowerReference = {
    status: "DATA_UNAVAILABLE",
    metric: null,
    value: null,
    source: null,
    message: "Regional purchasing-power data is not currently available from the prototype's verified data sources."
  };

  return {
    productUnit: "LITRE",
    userAssumedPricePerUnit,
    baseAnnualProductionUnits,
    operatingBreakEvenPricePerUnit,
    debtServiceBreakEvenPricePerUnit,
    stressAnnualProductionUnits,
    stressDebtServiceBreakEvenPricePerUnit,
    pricePosition,
    localMarketReference,
    purchasingPowerReference,
    limitations,
    validationActions,
    summary
  };
}
