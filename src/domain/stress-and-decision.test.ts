import { describe, it, expect } from "vitest";
import { DairyPlanInputs } from "./dairy/types";
import { EntrepreneurInputs } from "./finance/financial-assessment";
import { STRESS_CONFIG } from "../config/stress";
import { calculateStressAssessment } from "./stress/stress-engine";
import { evaluateDecision } from "./decision/decision-engine";
import { DECISION_CONFIG } from "../config/decision";

describe("Stress Testing Engine and Deterministic Decision Engine", () => {
  
  const getBaseDairyPlan = (): DairyPlanInputs => ({
    animalCount: 5,
    animalType: "buffalo",
    animalPurchaseCost: 80000,
    milkYieldPerDay: 15,
    milkPrice: 40,
    lactationDays: 300,
    feedCostPerDay: 150,
    veterinaryAnnual: 2000,
    labourMonthly: 3000,
    utilitiesMonthly: 500,
    insuranceAnnual: 4000,
    transportMonthly: 1000,
    otherOperatingAnnual: 2000,
    shedCost: 50000,
    equipmentCost: 20000,
    workingCapital: 30000,
    otherSetupCost: 5000
  });

  const getBaseEntrepreneur = (): EntrepreneurInputs => ({
    marginCapital: 100000,
    existingDebt: 0
  });

  const getPrimaryScenario = () => STRESS_CONFIG.scenarios.PRIMARY_DOWNSIDE;

  describe("Stress Engine Invariants", () => {
    it("Stress engine does not mutate base inputs", () => {
      const dp = getBaseDairyPlan();
      const ent = getBaseEntrepreneur();
      const clonedDp = JSON.parse(JSON.stringify(dp));
      const clonedEnt = JSON.parse(JSON.stringify(ent));

      calculateStressAssessment(ent, dp, getPrimaryScenario());

      expect(dp).toEqual(clonedDp);
      expect(ent).toEqual(clonedEnt);
    });

    it("Applies exact stress transformations correctly", () => {
      const dp = getBaseDairyPlan();
      const ent = getBaseEntrepreneur();
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());

      const baseRevenue = stressAssmnt.base.economics.annualMilkRevenue;
      const stressedRevenue = stressAssmnt.stressed.economics.annualMilkRevenue;
      
      const baseFeedCost = stressAssmnt.base.economics.annualFeedCost;
      const stressedFeedCost = stressAssmnt.stressed.economics.annualFeedCost;

      expect(stressedRevenue).toBeCloseTo(baseRevenue * 0.8, 2);
      expect(stressedFeedCost).toBeCloseTo(baseFeedCost * 1.15, 2);
      
      expect(stressAssmnt.base.repayment.annualRepaymentBurden).toEqual(
        stressAssmnt.stressed.repayment.annualRepaymentBurden
      );
      
      expect(stressAssmnt.base.project.projectCost).toEqual(
        stressAssmnt.stressed.project.projectCost
      );
    });

    it("All outputs are finite", () => {
      const dp = getBaseDairyPlan();
      const ent = getBaseEntrepreneur();
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());

      const assertFinite = (obj: unknown) => {
        if (typeof obj === "number") {
          expect(Number.isFinite(obj)).toBe(true);
        } else if (typeof obj === "object" && obj !== null) {
          for (const val of Object.values(obj)) {
            assertFinite(val);
          }
        }
      };
      
      assertFinite(stressAssmnt);
    });
  });

  describe("Decision Engine Test Cases", () => {
    
    it("Case A - PROCEED (Healthy Base, Cash-Positive Stress, Manageable Debt)", () => {
      const dp = getBaseDairyPlan();
      const ent = getBaseEntrepreneur();
      
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());
      const decision = evaluateDecision(stressAssmnt);

      expect(decision.status).toBe("PROCEED");
      expect(decision.reasonCodes).toContain("STRONG_BASE_ECONOMICS");
      expect(decision.reasonCodes).toContain("STRESS_CASE_REMAINS_POSITIVE");
    });

    it("Case B - MODIFY (Financially Positive Base, Negative Stress Cash)", () => {
      const dp = getBaseDairyPlan();
      dp.milkPrice = 24; 
      const ent = { marginCapital: 0, existingDebt: 0 }; 
      
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());
      const decision = evaluateDecision(stressAssmnt);

      expect(stressAssmnt.base.cashFlow.netCashAfterExistingDebt).toBeGreaterThan(0);
      expect(stressAssmnt.stressed.cashFlow.netCashAfterExistingDebt).toBeLessThanOrEqual(0);
      
      expect(decision.status).toBe("MODIFY");
      expect(decision.primaryReason).toBe("STRESS_POST_REPAYMENT_CASH_NEGATIVE");
    });

    it("Case B2 - MODIFY (Resilience Thin)", () => {
      const dp = getBaseDairyPlan();
      dp.milkPrice = 27;
      const ent = { marginCapital: 0, existingDebt: 0 };
      
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());
      
      const originalThreshold = DECISION_CONFIG.minimumStressCashBuffer;
      DECISION_CONFIG.minimumStressCashBuffer = 20000;
      
      const decision = evaluateDecision(stressAssmnt);
      
      expect(stressAssmnt.stressed.cashFlow.netCashAfterExistingDebt).toBeGreaterThan(0);
      expect(stressAssmnt.stressed.cashFlow.netCashAfterExistingDebt).toBeLessThan(20000);

      expect(decision.status).toBe("MODIFY");
      expect(decision.primaryReason).toBe("STRESS_RESILIENCE_THIN");
      
      DECISION_CONFIG.minimumStressCashBuffer = originalThreshold;
    });

    it("Case C - HIGH_RISK (Base Operating Surplus or Cash is Negative)", () => {
      const dp = getBaseDairyPlan();
      dp.milkPrice = 10; 
      const ent = getBaseEntrepreneur();
      
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());
      const decision = evaluateDecision(stressAssmnt);

      expect(stressAssmnt.base.economics.operatingSurplus).toBeLessThanOrEqual(0);
      expect(decision.status).toBe("HIGH_RISK");
      expect(decision.primaryReason).toBe("BASE_OPERATING_SURPLUS_NEGATIVE");
    });

    it("Case D - Eligible But Not Viable (Critical Proof: Eligibility != Viability)", () => {
      const dp = getBaseDairyPlan();
      dp.milkPrice = 18;
      const ent = { marginCapital: 0, existingDebt: 0 };
      
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());
      const decision = evaluateDecision(stressAssmnt);

      expect(stressAssmnt.base.financing.category).toBe("TERM_LOAN");
      expect(stressAssmnt.base.financing.withinPrototypeRange).toBe(true);

      expect(decision.status).toBe("HIGH_RISK");
      expect(decision.reasonCodes).toContain("BASE_POST_REPAYMENT_CASH_NEGATIVE");
    });

    it("Case E - Outside Financing Range (Prefer Modify)", () => {
      const dp = getBaseDairyPlan();
      dp.animalCount = 11;
      dp.animalPurchaseCost = 150000; 
      const ent = getBaseEntrepreneur();
      
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());
      const decision = evaluateDecision(stressAssmnt);

      expect(stressAssmnt.base.funding.fundingGap).toBeGreaterThan(1000000);
      expect(stressAssmnt.base.financing.category).toBe("OUTSIDE_PROTOTYPE_RANGE");

      expect(stressAssmnt.base.cashFlow.netCashAfterExistingDebt).toBeGreaterThan(0);
      expect(decision.status).toBe("MODIFY");
      expect(decision.primaryReason).toBe("FINANCING_OUTSIDE_PROTOTYPE_RANGE");
    });

    it("Case F - Existing Debt Pressure (High Risk)", () => {
      const dp = getBaseDairyPlan();
      const ent = { marginCapital: 100000, existingDebt: 45000 };
      
      const stressAssmnt = calculateStressAssessment(ent, dp, getPrimaryScenario());
      const decision = evaluateDecision(stressAssmnt);

      expect(stressAssmnt.base.cashFlow.postNewLoanRepaymentCash).toBeGreaterThan(0);
      expect(stressAssmnt.base.cashFlow.netCashAfterExistingDebt).toBeLessThanOrEqual(0);

      expect(decision.status).toBe("HIGH_RISK");
      expect(decision.primaryReason).toBe("EXISTING_DEBT_PRESSURE");
    });

    it("Determinism (Same input yields identical output)", () => {
      const dp = getBaseDairyPlan();
      const ent = getBaseEntrepreneur();
      const run1 = evaluateDecision(calculateStressAssessment(ent, dp, getPrimaryScenario()));
      const run2 = evaluateDecision(calculateStressAssessment(ent, dp, getPrimaryScenario()));
      expect(run1).toEqual(run2);
    });

  });
});
