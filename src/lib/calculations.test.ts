import { expect, test, describe } from 'vitest';
import { 
  calculateProjectCost, 
  getSchemeDetails, 
  calculateEconomics, 
  DairyInputs 
} from './calculations';

describe('Financial Calculations', () => {
  test('₹1 lakh margin -> ₹10 lakh project cost', () => {
    const cost = calculateProjectCost(100000);
    expect(cost).toBe(1000000);
  });

  test('₹1 lakh margin -> ₹9 lakh maximum loan (calculated by taking 90% of project cost, capped by scheme)', () => {
    const cost = calculateProjectCost(100000);
    const scheme = getSchemeDetails(cost);
    // 90% of 10L is 9L. Term Loan max is 45L. So 9L.
    const maxLoan = Math.min(cost * 0.90, scheme.maxLoan);
    expect(maxLoan).toBe(900000);
  });

  test('Micro Finance boundary at ₹1.40 lakh', () => {
    const scheme = getSchemeDetails(140000);
    expect(scheme.name).toBe("Micro Finance Scheme");
    expect(scheme.maxLoan).toBe(125000);
  });

  test('Term Loan routing above ₹1.40 lakh', () => {
    const scheme = getSchemeDetails(140001);
    expect(scheme.name).toBe("Term Loan Scheme");
    expect(scheme.maxLoan).toBe(4500000);
  });

  test('Project cost above ₹50 lakh', () => {
    const scheme = getSchemeDetails(5000001);
    expect(scheme.isEligible).toBe(false);
    expect(scheme.name).toBe("Outside current supported scheme range");
  });
});

describe('Dairy Business Economics', () => {
  const baseInputs: DairyInputs = {
    marginCapital: 100000,
    animalCount: 10,
    milkYieldPerDay: 10,
    milkPrice: 40,
    feedCostPerDay: 100,
  };

  test('normal dairy case', () => {
    const eco = calculateEconomics(baseInputs, 1.0, 1.0);
    expect(eco.annualMilkProduction).toBe(10 * 10 * 280); // 28000
    expect(eco.annualMilkRevenue).toBe(28000 * 40); // 1,120,000
    expect(eco.annualFeedCost).toBe(10 * 100 * 365); // 365,000
    // Total operating cost:
    // Feed: 365k
    // Vet: 10 * 2k = 20k
    // Labour: 10 * 6k = 60k
    // Utilities: 10 * 1k = 10k
    // Transport: 5k + 10 * 500 = 10k
    // Other: 2k
    // Total: 467k
    expect(eco.totalOperatingCost).toBe(467000);
    expect(eco.annualOperatingSurplus).toBe(1120000 - 467000); // 653k
    // Repayment: Loan is 9L, 8%, 7 years
    expect(eco.annualRepaymentBurden).toBeGreaterThan(0);
    expect(eco.postRepaymentSurplus).toBe(eco.annualOperatingSurplus - eco.annualRepaymentBurden);
  });

  test('stress dairy case', () => {
    const stressEco = calculateEconomics(baseInputs, 0.8, 1.15);
    // Yield 20% down -> 8L/day -> 8 * 10 * 280 = 22400
    expect(stressEco.annualMilkProduction).toBe(22400);
    expect(stressEco.annualMilkRevenue).toBe(22400 * 40); // 896,000
    
    // Feed cost 15% up -> 115/day -> 10 * 115 * 365 = 419750
    expect(stressEco.annualFeedCost).toBeCloseTo(419750, 2);
    
    // Total Operating cost should reflect higher feed cost
    expect(stressEco.totalOperatingCost).toBeCloseTo(419750 + 20000 + 60000 + 10000 + 10000 + 2000, 2); // 521750
    
    expect(stressEco.annualOperatingSurplus).toBeCloseTo(896000 - 521750, 2); // 374250
  });

  test('decision outcomes - PROCEED', () => {
    // Highly profitable setup
    const eco = calculateEconomics(baseInputs, 1.0, 1.0);
    const stressEco = calculateEconomics(baseInputs, 0.8, 1.15);
    expect(eco.postRepaymentSurplus).toBeGreaterThan(0);
    expect(stressEco.postRepaymentSurplus).toBeGreaterThan(0);
  });

  test('decision outcomes - HIGH RISK', () => {
    // Unprofitable setup
    const badInputs = { ...baseInputs, milkYieldPerDay: 2, milkPrice: 20 };
    const eco = calculateEconomics(badInputs, 1.0, 1.0);
    expect(eco.postRepaymentSurplus).toBeLessThanOrEqual(0);
  });

  test('decision outcomes - MODIFY', () => {
    // Marginally profitable setup
    const marginInputs = { ...baseInputs, milkYieldPerDay: 7, milkPrice: 35 };
    const eco = calculateEconomics(marginInputs, 1.0, 1.0);
    const stressEco = calculateEconomics(marginInputs, 0.8, 1.15);
    expect(eco.postRepaymentSurplus).toBeGreaterThan(0);
    expect(stressEco.postRepaymentSurplus).toBeLessThanOrEqual(0);
  });
});
