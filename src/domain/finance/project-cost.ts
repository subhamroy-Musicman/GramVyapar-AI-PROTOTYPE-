import { ProjectCostResult } from "./types";
import { DairyPlanInputs } from "../dairy/types";

export function calculateProjectCost(inputs: DairyPlanInputs): ProjectCostResult {
  const animalPurchaseTotal = inputs.animalCount * inputs.animalPurchaseCost;
  const projectCost = animalPurchaseTotal + inputs.shedCost + inputs.equipmentCost + inputs.workingCapital + inputs.otherSetupCost;

  return {
    animalPurchaseTotal,
    shedCost: inputs.shedCost,
    equipmentCost: inputs.equipmentCost,
    workingCapital: inputs.workingCapital,
    otherSetupCost: inputs.otherSetupCost,
    projectCost
  };
}
