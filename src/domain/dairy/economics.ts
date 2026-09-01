import { DairyPlanInputs, DairyEconomicsResult } from "./types";

export function calculateDairyEconomics(inputs: DairyPlanInputs): DairyEconomicsResult {
  const {
    animalCount,
    milkYieldPerDay,
    milkPrice,
    lactationDays,
    feedCostPerDay,
    veterinaryAnnual,
    labourMonthly,
    utilitiesMonthly,
    insuranceAnnual,
    transportMonthly,
    otherOperatingAnnual
  } = inputs;

  const annualMilkProduction = animalCount * milkYieldPerDay * lactationDays;
  const annualMilkRevenue = annualMilkProduction * milkPrice;

  const annualFeedCost = animalCount * feedCostPerDay * 365;
  const annualVeterinaryCost = veterinaryAnnual;
  const annualLabourCost = labourMonthly * 12;
  const annualUtilitiesCost = utilitiesMonthly * 12;
  const annualInsuranceCost = insuranceAnnual;
  const annualTransportCost = transportMonthly * 12;
  const annualOtherOperatingCost = otherOperatingAnnual;

  const annualOperatingExpenses =
    annualFeedCost +
    annualVeterinaryCost +
    annualLabourCost +
    annualUtilitiesCost +
    annualInsuranceCost +
    annualTransportCost +
    annualOtherOperatingCost;

  const operatingSurplus = annualMilkRevenue - annualOperatingExpenses;

  return {
    annualMilkProduction,
    annualMilkRevenue,
    annualFeedCost,
    annualVeterinaryCost,
    annualLabourCost,
    annualUtilitiesCost,
    annualInsuranceCost,
    annualTransportCost,
    annualOtherOperatingCost,
    annualOperatingExpenses,
    operatingSurplus
  };
}
