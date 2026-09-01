import { DairyPlanInputs } from "../dairy/types";
import { calculateDairyEconomics } from "../dairy/economics";
import { calculateProjectCost } from "./project-cost";
import { calculateFundingStructure } from "./funding";
import { routeFinancing } from "./financing";
import { calculateRepayment } from "./repayment";
import { FinancialAssessment } from "./types";

export interface EntrepreneurInputs {
  marginCapital: number;
  existingDebt: number;
}

export function calculateFinancialAssessment(
  entrepreneur: EntrepreneurInputs, 
  dairyPlan: DairyPlanInputs
): FinancialAssessment {
  // 1. Dairy Economics
  const economics = calculateDairyEconomics(dairyPlan);
  
  // 2. Project Cost
  const project = calculateProjectCost(dairyPlan);
  
  // 3. Funding Structure
  const funding = calculateFundingStructure(entrepreneur.marginCapital, project.projectCost);
  
  // 4. Financing Routing
  const financing = routeFinancing(funding.fundingGap);
  
  // 5. Repayment Simulation (Even if outside prototype range, simulate if possible, but keep explicit category)
  const repayment = calculateRepayment(funding.fundingGap, financing.category);
  
  // 6. Existing Debt
  const annualExistingDebtBurden = entrepreneur.existingDebt * 12;
  
  // 7. Cash Flow
  const postNewLoanRepaymentCash = economics.operatingSurplus - repayment.annualRepaymentBurden;
  const netCashAfterExistingDebt = postNewLoanRepaymentCash - annualExistingDebtBurden;
  
  return {
    economics,
    project,
    funding,
    financing,
    repayment,
    debt: {
      annualExistingDebtBurden
    },
    cashFlow: {
      postNewLoanRepaymentCash,
      netCashAfterExistingDebt
    }
  };
}
