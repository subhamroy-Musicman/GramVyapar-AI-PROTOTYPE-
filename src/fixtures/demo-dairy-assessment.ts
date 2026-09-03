
import { DairyPlanInputs } from '@/domain/dairy/types';
import { EntrepreneurInputs } from '@/domain/finance/financial-assessment';

export const CANONICAL_DEMO_ENTREPRENEUR: EntrepreneurInputs = {
  marginCapital: 100000,
  existingDebt: 0
};

export const CANONICAL_DEMO_DAIRY_PLAN: DairyPlanInputs = {
  animalCount: 5,
  animalType: 'cow',
  animalPurchaseCost: 60000,
  
  milkYieldPerDay: 12,
  milkPrice: 45,
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
