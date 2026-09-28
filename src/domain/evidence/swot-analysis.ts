import { FinancialAssessment } from "../finance/types";
import { StressAssessment } from "../stress/types";
import { EvidenceResult } from "./types";
import { MarketReachResult } from "./market-reach";
import { OpportunityAnalysisResult } from "./opportunity-analysis";
import { formatCurrency } from "../../lib/utils/formatters";

export type SwotSourceType =
  | "USER_INPUT"
  | "CALCULATED_RESULT"
  | "LOCAL_EVIDENCE"
  | "OPPORTUNITY_HYPOTHESIS"
  | "STRESS_RESULT"
  | "PROTOTYPE_ASSUMPTION";

export type SwotCategory = "STRENGTH" | "WEAKNESS" | "OPPORTUNITY" | "THREAT";
export type SwotConfidence = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

export interface SwotItem {
  id: string;
  category: SwotCategory;
  statement: string;
  sourceType: SwotSourceType;
  sourceDetail: string;
  confidence: SwotConfidence;
  action?: string;
}

export interface SwotAnalysisResult {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  overallConfidence: SwotConfidence;
  limitations: string[];
  summary: string;
}

export function calculateSwotAnalysis(
  financial: FinancialAssessment,
  stress: StressAssessment,
  evidence: EvidenceResult,
  marketReach: MarketReachResult,
  opportunityAnalysis: OpportunityAnalysisResult
): SwotAnalysisResult {
  const strengths: SwotItem[] = [];
  const weaknesses: SwotItem[] = [];
  const opportunities: SwotItem[] = [];
  const threats: SwotItem[] = [];
  
  const isDistrictFallback = evidence.location?.resolutionLevel === 'DISTRICT';
  const evidenceConfidenceLevel: SwotConfidence = isDistrictFallback ? "LOW" : "MEDIUM";

  // STRENGTHS
  if (financial.economics.operatingSurplus > 0) {
    strengths.push({
      id: "S_POSITIVE_SURPLUS",
      category: "STRENGTH",
      statement: "Current assumptions produce a positive projected operating surplus.",
      sourceType: "CALCULATED_RESULT",
      sourceDetail: `Operating surplus: ${formatCurrency(financial.economics.operatingSurplus)} under current user-entered assumptions.`,
      confidence: "HIGH"
    });
  }

  if (financial.cashFlow.postNewLoanRepaymentCash > 0) {
    strengths.push({
      id: "S_POSITIVE_CASH_POST_REPAYMENT",
      category: "STRENGTH",
      statement: "The projected business retains positive cash after scheduled debt repayment under the base case.",
      sourceType: "CALCULATED_RESULT",
      sourceDetail: `Post-repayment cash: ${formatCurrency(financial.cashFlow.postNewLoanRepaymentCash)}.`,
      confidence: "HIGH"
    });
  }

  if (marketReach.radius10km?.potentialSalesChannels > 0) {
    strengths.push({
      id: "S_MAPPED_CHANNELS",
      category: "STRENGTH",
      statement: "Mapped sales-channel access exists within the current evidence area.",
      sourceType: "LOCAL_EVIDENCE",
      sourceDetail: `Found ${marketReach.radius10km.potentialSalesChannels} potential sales channels.`,
      confidence: evidenceConfidenceLevel
    });
  }

  if (marketReach.radius10km?.supportInfrastructure > 0) {
    strengths.push({
      id: "S_SUPPORT_INFRA",
      category: "STRENGTH",
      statement: "Relevant mapped support infrastructure is present within the selected market area.",
      sourceType: "LOCAL_EVIDENCE",
      sourceDetail: `Found ${marketReach.radius10km.supportInfrastructure} support facilities.`,
      confidence: evidenceConfidenceLevel
    });
  }

  // WEAKNESSES
  const debtRatio = financial.funding.fundingGap / financial.project.projectCost;
  if (debtRatio > 0.8) {
    weaknesses.push({
      id: "W_HIGH_DEBT",
      category: "WEAKNESS",
      statement: "The project depends substantially on external financing (prototype heuristic).",
      sourceType: "CALCULATED_RESULT",
      sourceDetail: `${(debtRatio * 100).toFixed(0)}% of the project cost requires external funding.`,
      confidence: "HIGH",
      action: "Consider increasing own contribution or starting at a smaller scale."
    });
  }

  const baseCash = financial.cashFlow.postNewLoanRepaymentCash;
  const stressCash = stress.stressed.cashFlow.postNewLoanRepaymentCash;
  if (baseCash > 0 && stressCash > 0 && stressCash < baseCash * 0.7) {
    weaknesses.push({
      id: "W_STRESS_SENSITIVE",
      category: "WEAKNESS",
      statement: "The business is sensitive to adverse changes in milk yield and feed cost, though it remains viable in the scenario.",
      sourceType: "STRESS_RESULT",
      sourceDetail: `Post-repayment cash drops by ${formatCurrency(baseCash - stressCash)} under stress.`,
      confidence: "HIGH",
      action: "Maintain a strict cash buffer to handle potential yield drops."
    });
  }

  // OPPORTUNITIES
  opportunityAnalysis.opportunities.forEach(opp => {
    opportunities.push({
      id: `O_${opp.id}`,
      category: "OPPORTUNITY",
      statement: opp.hypothesis,
      sourceType: "OPPORTUNITY_HYPOTHESIS",
      sourceDetail: opp.observation,
      confidence: opp.confidence,
      action: opp.validationAction
    });
  });

  // THREATS
  if (stressCash < 0) {
    threats.push({
      id: "T_STRESS_DETERIORATION",
      category: "THREAT",
      statement: "Lower milk yield combined with higher feed cost can materially reduce repayment resilience, turning cash flow negative.",
      sourceType: "STRESS_RESULT",
      sourceDetail: `Stress scenario post-repayment cash falls to ${formatCurrency(stressCash)}.`,
      confidence: "HIGH",
      action: "Verify fixed costs and repayment flexibility before proceeding."
    });
  }

  if (evidence.commercialEvidenceCoverage === 'INSUFFICIENT' || evidence.commercialEvidenceCoverage === 'LOW' || isDistrictFallback) {
    threats.push({
      id: "T_SPARSE_EVIDENCE",
      category: "THREAT",
      statement: "Unmapped competitors or buyers may materially change the local market picture.",
      sourceType: "LOCAL_EVIDENCE",
      sourceDetail: isDistrictFallback ? "District-level data lacks village precision." : "Sparse commercial map data limits market visibility.",
      confidence: "LOW",
      action: "Conduct on-ground verification of local competitors and actual demand."
    });
  }

  const limitations = [
    "SWOT is based on user-entered business assumptions.",
    "Stress scenarios are predefined prototype scenarios.",
    "SWOT does not guarantee business success."
  ];

  if (marketReach.consumerBase.status === 'DATA_UNAVAILABLE') {
    limitations.push("Consumer population is currently unavailable.");
  }
  
  if (marketReach.status === 'LIMITED' || marketReach.status === 'DATA_UNAVAILABLE') {
    limitations.push("Local map data may be incomplete.");
  }
  
  if (opportunities.length > 0) {
    limitations.push("Opportunity hypotheses require field validation.");
  }

  const totalItems = strengths.length + weaknesses.length + opportunities.length + threats.length;
  let overallConfidence: SwotConfidence = "LOW";
  
  if (totalItems > 0 && !isDistrictFallback && evidence.commercialEvidenceCoverage !== 'INSUFFICIENT') {
    overallConfidence = "MEDIUM";
  }

  let summary = "";
  if (totalItems > 0) {
    summary = "The current plan shows structured business economics, but local-market assumptions and downside resilience still require validation.";
  } else {
    summary = "The financial model can be evaluated, but local evidence is not strong enough for a high-confidence market SWOT.";
  }

  return {
    strengths,
    weaknesses,
    opportunities,
    threats,
    overallConfidence,
    limitations,
    summary
  };
}
