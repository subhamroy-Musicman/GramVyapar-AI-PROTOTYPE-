import { describe, it, expect } from "vitest";
import { calculatePricingIntelligence } from "./pricing-intelligence";
import { FinancialAssessment, ProjectCostResult, FundingResult, FinancingResult, RepaymentResult, DebtResult, CashFlowResult } from "./types";
import { StressAssessment } from "../stress/types";
import { DairyPlanInputs, DairyEconomicsResult } from "../dairy/types";

function createMockData(price: number, prod: number, opCost: number, repayment: number, stressProd: number, stressOpCost: number) {
  const inputs: DairyPlanInputs = {
    animalCount: 5,
    animalType: "cow",
    animalPurchaseCost: 60000,
    milkYieldPerDay: 12,
    milkPrice: price,
    lactationDays: 280,
    feedCostPerDay: 150,
    veterinaryAnnual: 5000,
    labourMonthly: 0,
    utilitiesMonthly: 500,
    insuranceAnnual: 3000,
    transportMonthly: 1000,
    otherOperatingAnnual: 2000,
    shedCost: 50000,
    equipmentCost: 20000,
    workingCapital: 30000,
    otherSetupCost: 5000
  };

  const economics: DairyEconomicsResult = {
    annualMilkProduction: prod,
    annualMilkRevenue: prod * price,
    annualFeedCost: 0,
    annualVeterinaryCost: 0,
    annualLabourCost: 0,
    annualUtilitiesCost: 0,
    annualInsuranceCost: 0,
    annualTransportCost: 0,
    annualOtherOperatingCost: 0,
    annualOperatingExpenses: opCost,
    operatingSurplus: (prod * price) - opCost
  };

  const rep: RepaymentResult = {
    originalPrincipal: 100000,
    capitalizedPrincipal: 100000,
    annualInterestRate: 9,
    periodicRate: 0.0225,
    moratoriumMonths: 0,
    tenureYears: 5,
    repaymentPeriods: 20,
    paymentPerQuarter: repayment / 4,
    annualRepaymentBurden: repayment,
    totalRepayment: repayment * 5,
    totalInterest: 0
  };

  const debt: DebtResult = { annualExistingDebtBurden: 0 };
  
  const assessment: FinancialAssessment = {
    economics,
    project: {} as ProjectCostResult,
    funding: {} as FundingResult,
    financing: {} as FinancingResult,
    repayment: rep,
    debt,
    cashFlow: {} as CashFlowResult
  };

  const stress: StressAssessment = {
    base: assessment,
    scenario: { id: "test", label: "Test", milkYieldChangePct: 0, feedCostChangePct: 0 },
    stressed: {
      economics: { ...economics, annualMilkProduction: stressProd, annualOperatingExpenses: stressOpCost },
      project: {} as ProjectCostResult,
      funding: {} as FundingResult,
      financing: {} as FinancingResult,
      repayment: rep,
      debt,
      cashFlow: {} as CashFlowResult
    },
    comparison: {} as any
  };

  return { assessment, stress, inputs };
}

describe("Pricing Intelligence", () => {
  it("Zero production does not return Infinity or NaN", () => {
    const { assessment, stress, inputs } = createMockData(45, 0, 1000, 500, 0, 1200);
    const result = calculatePricingIntelligence(assessment, stress, inputs);
    expect(result).toBe("INSUFFICIENT_DATA");
  });

  it("Zero stress production handled safely", () => {
    const { assessment, stress, inputs } = createMockData(45, 1000, 1000, 500, 0, 1200);
    const result = calculatePricingIntelligence(assessment, stress, inputs);
    expect(result).not.toBe("INSUFFICIENT_DATA");
    if (result !== "INSUFFICIENT_DATA") {
      expect(result.stressDebtServiceBreakEvenPricePerUnit).toBeNull();
    }
  });

  it("Zero stress production: User price > base debt break-even => COVERS_BASE_DEBT_SERVICE", () => {
    // Op BE = 10, Debt BE = 15. Price = 25. Stress prod = 0.
    const { assessment, stress, inputs } = createMockData(25, 100, 1000, 500, 0, 1500);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.pricePosition).toBe("COVERS_BASE_DEBT_SERVICE");
    expect(result.summary).toContain("stress-case break-even price could not be calculated");
  });

  it("Zero stress production: User price below operating break-even => BELOW_OPERATING_BREAK_EVEN", () => {
    // Op BE = 10, Debt BE = 15. Price = 9. Stress prod = 0.
    const { assessment, stress, inputs } = createMockData(9, 100, 1000, 500, 0, 1500);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.pricePosition).toBe("BELOW_OPERATING_BREAK_EVEN");
  });

  it("Zero stress production: User price between operating and debt => COVERS_OPERATIONS_NOT_DEBT", () => {
    // Op BE = 10, Debt BE = 15. Price = 12. Stress prod = 0.
    const { assessment, stress, inputs } = createMockData(12, 100, 1000, 500, 0, 1500);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.pricePosition).toBe("COVERS_OPERATIONS_NOT_DEBT");
  });

  it("User price below operating break-even", () => {
    // Op cost 1000, prod 100 => operating BE = 10. Price = 9.
    const { assessment, stress, inputs } = createMockData(9, 100, 1000, 500, 100, 1200);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.pricePosition).toBe("BELOW_OPERATING_BREAK_EVEN");
  });

  it("User price above operating but below debt break-even", () => {
    // Op cost 1000, prod 100 => op BE = 10. Debt = 500 => debt BE = 15. Price = 12.
    const { assessment, stress, inputs } = createMockData(12, 100, 1000, 500, 100, 1200);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.pricePosition).toBe("COVERS_OPERATIONS_NOT_DEBT");
  });

  it("User price above debt but below stress break-even", () => {
    // Op BE = 10, Debt BE = 15. Stress Op = 1500 => Stress Debt BE = 20. Price = 18.
    const { assessment, stress, inputs } = createMockData(18, 100, 1000, 500, 100, 1500);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.pricePosition).toBe("COVERS_BASE_DEBT_SERVICE");
  });

  it("User price above stress break-even", () => {
    // Stress Debt BE = 20. Price = 25.
    const { assessment, stress, inputs } = createMockData(25, 100, 1000, 500, 100, 1500);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.pricePosition).toBe("COVERS_STRESS_DEBT_SERVICE");
  });

  it("Local market reference unavailable returns null price", () => {
    const { assessment, stress, inputs } = createMockData(25, 100, 1000, 500, 100, 1500);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.localMarketReference.status).toBe("DATA_UNAVAILABLE");
    expect(result.localMarketReference.pricePerUnit).toBeNull();
  });

  it("Purchasing-power unavailable returns null value", () => {
    const { assessment, stress, inputs } = createMockData(25, 100, 1000, 500, 100, 1500);
    const result = calculatePricingIntelligence(assessment, stress, inputs) as any;
    expect(result.purchasingPowerReference.status).toBe("DATA_UNAVAILABLE");
    expect(result.purchasingPowerReference.value).toBeNull();
  });
});
