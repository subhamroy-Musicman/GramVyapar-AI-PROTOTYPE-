import { AdvisoryInput, SupportedLanguage } from "../../domain/advisory/types";
import { FinancialAssessment } from "../../domain/finance/types";
import { StressAssessment } from "../../domain/stress/types";
import { DecisionResult } from "../../domain/decision/types";
import { EvidenceResult } from "../../domain/evidence/types";
import { AssessmentData } from "../../components/assessment/schema";

export function buildAdvisoryInput(
  data: AssessmentData,
  financial: FinancialAssessment,
  stress: StressAssessment,
  decision: DecisionResult,
  evidence: EvidenceResult,
  language: SupportedLanguage
): AdvisoryInput {
  
  const r5 = evidence.radius5km;
  const r10 = evidence.radius10km;
  
  return {
    language,
    entrepreneur: {
      location: `${data.village}, ${data.district}, ${data.state}`,
      assessmentPurpose: data.businessIntent,
      experienceYears: data.yearsLivestock,
    },
    business: {
      category: "DAIRY",
      animalCount: data.animalCount,
      animalType: data.animalType,
    },
    financial: {
      projectCost: financial.project.projectCost,
      ownContribution: financial.funding.effectiveOwnContribution,
      fundingGap: financial.funding.fundingGap,
      financingCategory: financial.financing.category,
      annualRevenue: financial.economics.annualMilkRevenue,
      annualOperatingExpenses: financial.economics.annualOperatingExpenses,
      operatingSurplus: financial.economics.operatingSurplus,
      annualRepaymentBurden: financial.repayment.annualRepaymentBurden,
      postRepaymentCash: financial.cashFlow.postNewLoanRepaymentCash,
      netCashAfterExistingDebt: financial.cashFlow.netCashAfterExistingDebt,
    },
    stress: {
      scenarioLabel: stress.scenario.label,
      milkYieldChangePct: stress.scenario.milkYieldChangePct,
      feedCostChangePct: stress.scenario.feedCostChangePct,
      annualRevenue: stress.stressed.economics.annualMilkRevenue,
      annualOperatingExpenses: stress.stressed.economics.annualOperatingExpenses,
      operatingSurplus: stress.stressed.economics.operatingSurplus,
      annualRepaymentBurden: stress.stressed.repayment.annualRepaymentBurden,
      postRepaymentCash: stress.stressed.cashFlow.postNewLoanRepaymentCash,
      netCashAfterExistingDebt: stress.stressed.cashFlow.netCashAfterExistingDebt,
    },
    decision: {
      status: decision.status,
      primaryReason: decision.primaryReason,
      reasonCodes: decision.reasonCodes,
      warnings: decision.warnings,
    },
    localEvidence: {
      evidenceStatus: evidence.availability,
      resolvedLocation: evidence.location?.resolvedDisplayName,
      radius5km: {
        providerAvailable: r5 ? r5.providerAvailable : false,
        directDairySignals: r5 ? r5.directDairySignals.length : 0,
        potentialSalesChannels: r5 ? r5.potentialSalesChannels.length : 0,
        supportInfrastructure: r5 ? r5.supportInfrastructure.length : 0,
      },
      radius10km: {
        providerAvailable: r10 ? r10.providerAvailable : false,
        directDairySignals: r10 ? r10.directDairySignals.length : 0,
        potentialSalesChannels: r10 ? r10.potentialSalesChannels.length : 0,
        supportInfrastructure: r10 ? r10.supportInfrastructure.length : 0,
      },
      dairySpecificConfidence: evidence.dairySpecificConfidence,
      mappedDairyActivity: evidence.competitiveSignal,
      salesChannelSignal: evidence.salesChannelSignal,
      limitations: evidence.limitations,
    },
  };
}
