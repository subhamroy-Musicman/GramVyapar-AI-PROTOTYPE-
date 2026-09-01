import { FINANCE_CONFIG, FinancingCategory } from "../../config/finance";
import { RepaymentResult } from "./types";

export function calculateRepayment(principal: number, category: FinancingCategory): RepaymentResult {
  if (principal <= 0 || category === "SELF_FUNDED") {
    return {
      originalPrincipal: 0,
      capitalizedPrincipal: 0,
      annualInterestRate: 0,
      periodicRate: 0,
      moratoriumMonths: 0,
      tenureYears: 0,
      repaymentPeriods: 0,
      paymentPerQuarter: 0,
      annualRepaymentBurden: 0,
      totalRepayment: 0,
      totalInterest: 0
    };
  }

  // Moratorium interpretation: interest during moratorium is capitalized into principal
  const moratoriumYears = FINANCE_CONFIG.moratoriumMonths / 12;
  const capitalizedPrincipal = principal * (1 + FINANCE_CONFIG.annualInterestRate * moratoriumYears);
  
  // Repayment parameters
  const repaymentYears = FINANCE_CONFIG.tenureYears - moratoriumYears;
  const repaymentPeriods = repaymentYears * FINANCE_CONFIG.periodsPerYear;
  const quarterlyRate = FINANCE_CONFIG.annualInterestRate / FINANCE_CONFIG.periodsPerYear;
  
  let paymentPerQuarter = 0;
  if (quarterlyRate === 0) {
    paymentPerQuarter = capitalizedPrincipal / repaymentPeriods;
  } else {
    // Amortizing formula
    const factor = Math.pow(1 + quarterlyRate, repaymentPeriods);
    paymentPerQuarter = (capitalizedPrincipal * quarterlyRate * factor) / (factor - 1);
  }

  const annualRepaymentBurden = paymentPerQuarter * FINANCE_CONFIG.periodsPerYear;
  const totalRepayment = paymentPerQuarter * repaymentPeriods;
  const totalInterest = totalRepayment - principal; // Interest over the whole lifecycle

  return {
    originalPrincipal: principal,
    capitalizedPrincipal,
    annualInterestRate: FINANCE_CONFIG.annualInterestRate,
    periodicRate: quarterlyRate,
    moratoriumMonths: FINANCE_CONFIG.moratoriumMonths,
    tenureYears: FINANCE_CONFIG.tenureYears,
    repaymentPeriods,
    paymentPerQuarter,
    annualRepaymentBurden,
    totalRepayment,
    totalInterest
  };
}
