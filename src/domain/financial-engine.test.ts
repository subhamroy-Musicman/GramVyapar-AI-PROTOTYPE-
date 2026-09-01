/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { calculateFinancialAssessment } from "./finance/financial-assessment";
import { DairyPlanInputs } from "./dairy/types";
import { FINANCE_CONFIG } from "../config/finance";

describe("Deterministic Financial Engine", () => {
  const getBaseDairyPlan = (): DairyPlanInputs => ({
    animalCount: 5,
    animalType: "cow",
    animalPurchaseCost: 60000,
    milkYieldPerDay: 15,
    milkPrice: 40,
    lactationDays: 300,
    feedCostPerDay: 150,
    veterinaryAnnual: 5000,
    labourMonthly: 3000,
    utilitiesMonthly: 500,
    insuranceAnnual: 3000,
    transportMonthly: 1000,
    otherOperatingAnnual: 2000,
    shedCost: 50000,
    equipmentCost: 20000,
    workingCapital: 30000,
    otherSetupCost: 5000
  });

  const getBaseEntrepreneur = () => ({
    marginCapital: 50000,
    existingDebt: 2000
  });

  describe("Dairy Economics", () => {
    const result = calculateFinancialAssessment(getBaseEntrepreneur(), getBaseDairyPlan());
    const eco = result.economics;

    it("1. Annual milk production", () => {
      // 5 * 15 * 300 = 22500
      expect(eco.annualMilkProduction).toBe(22500);
    });

    it("2. Annual milk revenue", () => {
      // 22500 * 40 = 900000
      expect(eco.annualMilkRevenue).toBe(900000);
    });

    it("3. Annual feed cost", () => {
      // 5 * 150 * 365 = 273750
      expect(eco.annualFeedCost).toBe(273750);
    });

    it("4. Monthly labour -> annual", () => {
      // 3000 * 12 = 36000
      expect(eco.annualLabourCost).toBe(36000);
    });

    it("5. Monthly utilities -> annual", () => {
      // 500 * 12 = 6000
      expect(eco.annualUtilitiesCost).toBe(6000);
    });

    it("6. Monthly transport -> annual", () => {
      // 1000 * 12 = 12000
      expect(eco.annualTransportCost).toBe(12000);
    });

    it("7. Total operating expenses", () => {
      // 273750 + 5000(vet) + 36000(labour) + 6000(util) + 3000(ins) + 12000(trans) + 2000(other) = 337750
      expect(eco.annualOperatingExpenses).toBe(337750);
    });

    it("8. Operating surplus", () => {
      // 900000 - 337750 = 562250
      expect(eco.operatingSurplus).toBe(562250);
    });
  });

  describe("Project Cost", () => {
    const result = calculateFinancialAssessment(getBaseEntrepreneur(), getBaseDairyPlan());
    const proj = result.project;

    it("9. Animal purchase total", () => {
      // 5 * 60000 = 300000
      expect(proj.animalPurchaseTotal).toBe(300000);
    });

    it("10. Project cost", () => {
      // 300000 + 50000(shed) + 20000(equip) + 30000(wc) + 5000(other) = 405000
      expect(proj.projectCost).toBe(405000);
    });
  });

  describe("Funding", () => {
    it("11. Full self-funded case", () => {
      const ent = getBaseEntrepreneur();
      ent.marginCapital = 500000; // More than 405000
      const result = calculateFinancialAssessment(ent, getBaseDairyPlan());
      expect(result.funding.effectiveOwnContribution).toBe(405000);
      expect(result.funding.fundingGap).toBe(0);
    });

    it("12. Partial contribution", () => {
      const ent = getBaseEntrepreneur();
      ent.marginCapital = 100000;
      const result = calculateFinancialAssessment(ent, getBaseDairyPlan());
      expect(result.funding.effectiveOwnContribution).toBe(100000);
      expect(result.funding.fundingGap).toBe(305000);
    });

    it("13. Available capital greater than project cost", () => {
      const ent = getBaseEntrepreneur();
      ent.marginCapital = 1000000;
      const result = calculateFinancialAssessment(ent, getBaseDairyPlan());
      expect(result.funding.effectiveOwnContribution).toBe(405000);
      expect(result.funding.fundingGap).toBe(0);
    });
  });

  describe("Routing", () => {
    const route = (gap: number) => {
      // Hack project cost to easily control funding gap
      const ent = { marginCapital: 0, existingDebt: 0 };
      const dp = getBaseDairyPlan();
      dp.animalCount = 1;
      dp.animalPurchaseCost = gap;
      dp.shedCost = 0; dp.equipmentCost = 0; dp.workingCapital = 0; dp.otherSetupCost = 0;
      return calculateFinancialAssessment(ent, dp).financing;
    };

    it("14. fundingGap = 0 -> SELF_FUNDED", () => {
      expect(route(0).category).toBe("SELF_FUNDED");
    });
    it("15. fundingGap = 150000 -> MICRO_LOAN", () => {
      expect(route(150000).category).toBe("MICRO_LOAN");
    });
    it("16. fundingGap = 150001 -> SMALL_ENTERPRISE_FINANCE", () => {
      expect(route(150001).category).toBe("SMALL_ENTERPRISE_FINANCE");
    });
    it("17. fundingGap = 500000 -> SMALL_ENTERPRISE_FINANCE", () => {
      expect(route(500000).category).toBe("SMALL_ENTERPRISE_FINANCE");
    });
    it("18. fundingGap = 500001 -> TERM_LOAN", () => {
      expect(route(500001).category).toBe("TERM_LOAN");
    });
    it("19. fundingGap = 1000000 -> TERM_LOAN", () => {
      expect(route(1000000).category).toBe("TERM_LOAN");
    });
    it("20. fundingGap = 1000001 -> OUTSIDE_PROTOTYPE_RANGE", () => {
      expect(route(1000001).category).toBe("OUTSIDE_PROTOTYPE_RANGE");
    });
  });

  describe("Repayment", () => {
    const getRepay = (gap: number, ) => {
      const ent = { marginCapital: 0, existingDebt: 0 };
      const dp = getBaseDairyPlan();
      dp.animalCount = 1; dp.animalPurchaseCost = gap;
      dp.shedCost = 0; dp.equipmentCost = 0; dp.workingCapital = 0; dp.otherSetupCost = 0;
      return calculateFinancialAssessment(ent, dp).repayment;
    };

    it("21. standard principal & 24. moratorium handling & 25. quarterly annualization", () => {
      const rep = getRepay(100000);
      // Moratorium is 6 months (0.5 years). 8% interest.
      // Capitalized principal = 100000 * (1 + 0.08 * 0.5) = 104000
      expect(rep.capitalizedPrincipal).toBe(104000);
      // Tenure is 7 years, minus 0.5 = 6.5 years of repayment. 4 periods/year = 26 periods.
      expect(rep.repaymentPeriods).toBe(26);
      expect(rep.periodicRate).toBe(0.02); // 8% / 4
      
      // Amortization: P = 104000, r = 0.02, n = 26
      // PMT = (104000 * 0.02 * 1.02^26) / (1.02^26 - 1)
      const factor = Math.pow(1.02, 26);
      const expectedPmt = (104000 * 0.02 * factor) / (factor - 1);
      expect(rep.paymentPerQuarter).toBeCloseTo(expectedPmt, 2);
      expect(rep.annualRepaymentBurden).toBeCloseTo(expectedPmt * 4, 2);
    });

    it("22. zero-interest case", () => {
      const originalRate = FINANCE_CONFIG.annualInterestRate;
      FINANCE_CONFIG.annualInterestRate = 0;
      
      const rep = getRepay(100000); // Principal
      
      // Moratorium logic applies but with 0 interest: Capitalized = 100000
      expect(rep.capitalizedPrincipal).toBe(100000);
      expect(rep.periodicRate).toBe(0);
      
      // Tenure is 6.5 years -> 26 periods
      // paymentPerPeriod = principal / periods
      expect(rep.paymentPerQuarter).toBe(100000 / 26);
      
      // totalRepayment = paymentPerPeriod * periods = 100000
      expect(rep.totalRepayment).toBe(100000);
      expect(rep.totalInterest).toBe(0);
      
      // Ensure no NaNs or Infinity
      expect(Number.isFinite(rep.paymentPerQuarter)).toBe(true);
      expect(Number.isFinite(rep.totalRepayment)).toBe(true);
      
      // Restore config
      FINANCE_CONFIG.annualInterestRate = originalRate;
    });

    it("23. zero principal", () => {
      const rep = getRepay(0);
      expect(rep.originalPrincipal).toBe(0);
      expect(rep.annualRepaymentBurden).toBe(0);
    });
  });

  describe("Debt and Cash Flow", () => {
    it("26. existing monthly debt x12 & 27. post new loan & 28. net cash", () => {
      const ent = getBaseEntrepreneur();
      ent.marginCapital = 50000;
      ent.existingDebt = 2000; // 24000 annual
      const result = calculateFinancialAssessment(ent, getBaseDairyPlan());
      
      expect(result.debt.annualExistingDebtBurden).toBe(24000);
      
      const rep = result.repayment;
      const expectedPostNew = result.economics.operatingSurplus - rep.annualRepaymentBurden;
      expect(result.cashFlow.postNewLoanRepaymentCash).toBeCloseTo(expectedPostNew, 2);
      
      const expectedNet = expectedPostNew - 24000;
      expect(result.cashFlow.netCashAfterExistingDebt).toBeCloseTo(expectedNet, 2);
    });
  });

  describe("Manual Reconciliation Case", () => {
    it("Reconciles perfectly", () => {
      // 5 animals, 1L available capital. Same dairy inputs as base.
      const ent = { marginCapital: 100000, existingDebt: 0 };
      const result = calculateFinancialAssessment(ent, getBaseDairyPlan());
      
      // Expected Production: 5 * 15 * 300 = 22500
      expect(result.economics.annualMilkProduction).toBe(22500);
      // Expected Revenue: 22500 * 40 = 900000
      expect(result.economics.annualMilkRevenue).toBe(900000);
      // Expected Op Expenses = 337750
      expect(result.economics.annualOperatingExpenses).toBe(337750);
      // Expected Op Surplus = 562250
      expect(result.economics.operatingSurplus).toBe(562250);
      
      // Expected Project Cost = 405000
      expect(result.project.projectCost).toBe(405000);
      // Expected Funding Gap = 405000 - 100000 = 305000
      expect(result.funding.fundingGap).toBe(305000);
      
      // Expected Financing Category = SMALL_ENTERPRISE_FINANCE
      expect(result.financing.category).toBe("SMALL_ENTERPRISE_FINANCE");
      
      // Capitalized Principal = 305000 * (1 + 0.08 * 0.5) = 317200
      expect(result.repayment.capitalizedPrincipal).toBe(317200);
      
      // Payment per quarter = P*r*(1+r)^n / ((1+r)^n - 1)
      // r = 0.02, n = 26
      const factor = Math.pow(1.02, 26);
      const expectedQ = (317200 * 0.02 * factor) / (factor - 1);
      
      expect(result.repayment.paymentPerQuarter).toBeCloseTo(expectedQ, 2);
      expect(result.repayment.annualRepaymentBurden).toBeCloseTo(expectedQ * 4, 2);
      
      const expectedPostRepay = 562250 - (expectedQ * 4);
      expect(result.cashFlow.netCashAfterExistingDebt).toBeCloseTo(expectedPostRepay, 2);
    });
  });

  describe("End-to-End Safety and Outside Prototype Range", () => {
    it("Calculates 11-animal case securely without clamping or NaN", () => {
      const dp = getBaseDairyPlan();
      dp.animalCount = 11;
      dp.animalPurchaseCost = 150000;
      
      const ent = { marginCapital: 100000, existingDebt: 5000 };
      
      const result = calculateFinancialAssessment(ent, dp);
      
      // 11 * 150000 = 16.5 Lakhs. Total project will definitely exceed 10L.
      expect(result.project.animalPurchaseTotal).toBe(1650000);
      
      // Gap > 10L -> OUTSIDE_PROTOTYPE_RANGE
      expect(result.funding.fundingGap).toBeGreaterThan(1000000);
      expect(result.financing.category).toBe("OUTSIDE_PROTOTYPE_RANGE");
      expect(result.financing.withinPrototypeRange).toBe(false);
      
      // Economics should remain pristine, uncorrupted, and perfectly calculated
      expect(result.economics.annualMilkProduction).toBe(11 * 15 * 300); // 49500
      expect(result.economics.annualMilkRevenue).toBe(49500 * 40); // 19.8L
      
      // Walk through every key in the result to ensure finiteness (no NaN, Infinity)
      const assertFinite = (obj: Record<string, any>) => {
        for (const val of Object.values(obj)) {
          if (typeof val === "number") {
            expect(Number.isFinite(val)).toBe(true);
          } else if (typeof val === "object" && val !== null) {
            assertFinite(val);
          }
        }
      };
      
      assertFinite(result);
    });
  });
});

