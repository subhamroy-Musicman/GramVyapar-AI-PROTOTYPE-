export interface DairyPlanInputs {
  animalCount: number;
  animalType: "cow" | "buffalo";
  animalPurchaseCost: number;
  
  milkYieldPerDay: number;
  milkPrice: number;
  lactationDays: number;
  
  feedCostPerDay: number;
  veterinaryAnnual: number;
  labourMonthly: number;
  utilitiesMonthly: number;
  insuranceAnnual: number;
  transportMonthly: number;
  otherOperatingAnnual: number;
  
  shedCost: number;
  equipmentCost: number;
  workingCapital: number;
  otherSetupCost: number;
}

export interface DairyEconomicsResult {
  annualMilkProduction: number;
  annualMilkRevenue: number;
  annualFeedCost: number;
  annualVeterinaryCost: number;
  annualLabourCost: number;
  annualUtilitiesCost: number;
  annualInsuranceCost: number;
  annualTransportCost: number;
  annualOtherOperatingCost: number;
  annualOperatingExpenses: number;
  operatingSurplus: number;
}
