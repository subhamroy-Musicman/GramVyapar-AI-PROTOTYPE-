import { FinancingCategory } from "../../config/finance";
import { DairyEconomicsResult } from "../dairy/types";

export interface ProjectCostResult {
  animalPurchaseTotal: number;
  shedCost: number;
  equipmentCost: number;
  workingCapital: number;
  otherSetupCost: number;
  projectCost: number;
}

export interface FundingResult {
  availableCapital: number;
  effectiveOwnContribution: number;
  fundingGap: number;
}

export interface FinancingResult {
  category: FinancingCategory;
  fundingRequirement: number;
  withinPrototypeRange: boolean;
  reasonCode: string;
}

export interface RepaymentResult {
  originalPrincipal: number;
  capitalizedPrincipal: number;
  annualInterestRate: number;
  periodicRate: number;
  moratoriumMonths: number;
  tenureYears: number;
  repaymentPeriods: number;
  paymentPerQuarter: number;
  annualRepaymentBurden: number;
  totalRepayment: number;
  totalInterest: number;
}

export interface DebtResult {
  annualExistingDebtBurden: number;
}

export interface CashFlowResult {
  postNewLoanRepaymentCash: number;
  netCashAfterExistingDebt: number;
}

export interface FinancialAssessment {
  economics: DairyEconomicsResult;
  project: ProjectCostResult;
  funding: FundingResult;
  financing: FinancingResult;
  repayment: RepaymentResult;
  debt: DebtResult;
  cashFlow: CashFlowResult;
}
