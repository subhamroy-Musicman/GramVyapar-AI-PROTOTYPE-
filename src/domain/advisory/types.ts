export type SupportedLanguage = "en" | "hi" | "bn" | "mr" | "ta";

export interface AdvisoryInput {
  language: SupportedLanguage;

  entrepreneur: {
    location: string;
    assessmentPurpose?: string;
    experienceYears?: number;
  };

  business: {
    category: "DAIRY";
    animalCount: number;
    animalType: string;
  };

  financial: {
    projectCost: number;
    ownContribution: number;
    fundingGap: number;
    financingCategory: string;
    annualRevenue: number;
    annualOperatingExpenses: number;
    operatingSurplus: number;
    annualRepaymentBurden: number;
    postRepaymentCash: number;
    netCashAfterExistingDebt: number;
  };

  stress: {
    scenarioLabel: string;
    milkYieldChangePct: number;
    feedCostChangePct: number;
    annualRevenue: number;
    annualOperatingExpenses: number;
    operatingSurplus: number;
    annualRepaymentBurden: number;
    postRepaymentCash: number;
    netCashAfterExistingDebt: number;
  };

  decision: {
    status: "PROCEED" | "MODIFY" | "HIGH_RISK";
    primaryReason: string;
    reasonCodes: string[];
    warnings: string[];
  };

  localEvidence: {
    evidenceStatus: string;
    resolvedLocation?: string;
    radius5km: {
      providerAvailable: boolean;
      directDairySignals: number;
      potentialSalesChannels: number;
      supportInfrastructure: number;
    };
    radius10km: {
      providerAvailable: boolean;
      directDairySignals: number;
      potentialSalesChannels: number;
      supportInfrastructure: number;
    };
    dairySpecificConfidence: string;
    mappedDairyActivity: string;
    salesChannelSignal: string;
    limitations: string[];
  };
}

export interface AdvisoryResult {
  language: SupportedLanguage;
  summary: string;
  whyThisDecision: string;
  biggestRisks: string[];
  stressTestInterpretation: string;
  localEvidenceContext: string;
  recommendedActions: string[];
  verifyBeforeBorrowing: string[];
  disclaimer: string;
}
