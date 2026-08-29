export interface DairyInputs {
  marginCapital: number;
  animalCount: number;
  milkYieldPerDay: number;
  milkPrice: number;
  feedCostPerDay: number;
}

export interface SchemeDetails {
  name: string;
  maxLoan: number;
  interestRate: number;
  tenureYears: number;
  moratoriumMonths: number;
  isEligible: boolean;
  message?: string;
}

export function calculateProjectCost(marginCapital: number) {
  return marginCapital / 0.10;
}

export function getSchemeDetails(projectCost: number): SchemeDetails {
  if (projectCost <= 140000) {
    return {
      name: "Micro Finance Scheme",
      maxLoan: 125000,
      interestRate: 6.5,
      tenureYears: 3,
      moratoriumMonths: 3,
      isEligible: true,
    };
  } else if (projectCost <= 5000000) {
    return {
      name: "Term Loan Scheme",
      maxLoan: 4500000,
      interestRate: 8.0,
      tenureYears: 7,
      moratoriumMonths: 6,
      isEligible: true,
    };
  } else {
    return {
      name: "Outside current supported scheme range",
      maxLoan: 0,
      interestRate: 0,
      tenureYears: 0,
      moratoriumMonths: 0,
      isEligible: false,
      message: "Project Cost exceeds ₹50 lakh limit for prototype schemes.",
    };
  }
}

export function calculateRepayment(principal: number, annualInterestRate: number, tenureYears: number) {
  if (principal <= 0) return 0;
  // Simple EMI calculation
  const r = annualInterestRate / 12 / 100;
  const n = tenureYears * 12;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return emi * 12; // Annual repayment burden
}

export interface BusinessEconomics {
  annualMilkProduction: number;
  annualMilkRevenue: number;
  annualFeedCost: number;
  veterinaryCost: number;
  labourCost: number;
  utilitiesCost: number;
  transportCost: number;
  otherCosts: number;
  totalOperatingCost: number;
  annualOperatingSurplus: number;
  monthlyOperatingSurplus: number;
  annualRepaymentBurden: number;
  postRepaymentSurplus: number;
}

export function calculateEconomics(
  inputs: DairyInputs,
  yieldMultiplier: number = 1.0,
  feedCostMultiplier: number = 1.0
): BusinessEconomics {
  const { animalCount, milkPrice } = inputs;
  const milkYieldPerDay = inputs.milkYieldPerDay * yieldMultiplier;
  const feedCostPerDay = inputs.feedCostPerDay * feedCostMultiplier;

  const annualMilkProduction = animalCount * milkYieldPerDay * 280;
  const annualMilkRevenue = annualMilkProduction * milkPrice;
  const annualFeedCost = animalCount * feedCostPerDay * 365;

  // Prototype assumptions
  const veterinaryCost = animalCount * 2000;
  const labourCost = animalCount * 6000;
  const utilitiesCost = animalCount * 1000;
  const transportCost = 5000 + (animalCount * 500);
  const otherCosts = 2000;

  const totalOperatingCost = annualFeedCost + veterinaryCost + labourCost + utilitiesCost + transportCost + otherCosts;
  const annualOperatingSurplus = annualMilkRevenue - totalOperatingCost;
  const monthlyOperatingSurplus = annualOperatingSurplus / 12;

  const projectCost = calculateProjectCost(inputs.marginCapital);
  const scheme = getSchemeDetails(projectCost);
  const loanAmount = Math.min(projectCost * 0.90, scheme.maxLoan);
  
  const annualRepaymentBurden = scheme.isEligible ? calculateRepayment(loanAmount, scheme.interestRate, scheme.tenureYears) : 0;
  const postRepaymentSurplus = annualOperatingSurplus - annualRepaymentBurden;

  return {
    annualMilkProduction,
    annualMilkRevenue,
    annualFeedCost,
    veterinaryCost,
    labourCost,
    utilitiesCost,
    transportCost,
    otherCosts,
    totalOperatingCost,
    annualOperatingSurplus,
    monthlyOperatingSurplus,
    annualRepaymentBurden,
    postRepaymentSurplus,
  };
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
