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
  evidence: EvidenceResult | null | 'UNAVAILABLE',
  marketReach: MarketReachResult | null,
  opportunityAnalysis: OpportunityAnalysisResult | null
): SwotAnalysisResult {
  const strengths: SwotItem[] = [];
  const weaknesses: SwotItem[] = [];
  const opportunities: SwotItem[] = [];
  const threats: SwotItem[] = [];
  
  const isEvidenceAvailable = evidence && evidence !== 'UNAVAILABLE' && (evidence as EvidenceResult).availability !== 'PROVIDER_UNAVAILABLE';
  const isDistrictFallback = isEvidenceAvailable && (evidence as EvidenceResult).location?.resolutionLevel === 'DISTRICT';
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

  if (marketReach && marketReach.radius10km?.potentialSalesChannels > 0) {
    strengths.push({
      id: "S_MAPPED_CHANNELS",
      category: "STRENGTH",
      statement: "Mapped sales-channel access exists within the current evidence area.",
      sourceType: "LOCAL_EVIDENCE",
      sourceDetail: `Found ${marketReach.radius10km.potentialSalesChannels} potential sales channels.`,
      confidence: evidenceConfidenceLevel
    });
  }

  if (marketReach && marketReach.radius10km?.supportInfrastructure > 0) {
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
  // Removed arbitrary 80% debt-dependence rule as requested.
  // Removed arbitrary 30% stress deterioration rule as requested.
  // Leaving weaknesses empty if no internal business weakness is identified deterministically.

  // OPPORTUNITIES
  opportunityAnalysis?.opportunities.forEach(opp => {
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
  const stressCash = stress.stressed.cashFlow.postNewLoanRepaymentCash;
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

  if (isEvidenceAvailable) {
    const ev = evidence as EvidenceResult;
    if (ev.commercialEvidenceCoverage === 'INSUFFICIENT' || ev.commercialEvidenceCoverage === 'LOW' || isDistrictFallback) {
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
  }

  const limitations = [
    "SWOT is based on user-entered business assumptions.",
    "Stress scenarios are predefined prototype scenarios.",
    "SWOT does not guarantee business success."
  ];

  if (!isEvidenceAvailable || !marketReach || marketReach.status === 'DATA_UNAVAILABLE') {
    limitations.push("Local evidence is unavailable, so location-specific SWOT items could not be evaluated.");
  } else {
    if (marketReach.consumerBase.status === 'DATA_UNAVAILABLE') {
      limitations.push("Consumer population is currently unavailable.");
    }
    
    if (marketReach.status === 'LIMITED') {
      limitations.push("Local map data may be incomplete.");
    }
  }
  
  if (opportunities.length > 0) {
    limitations.push("Opportunity hypotheses require field validation.");
  }

  const totalItems = strengths.length + weaknesses.length + opportunities.length + threats.length;
  let overallConfidence: SwotConfidence = "LOW";
  
  if (isEvidenceAvailable) {
    const ev = evidence as EvidenceResult;
    if (totalItems > 0 && !isDistrictFallback && ev.commercialEvidenceCoverage !== 'INSUFFICIENT') {
      overallConfidence = "MEDIUM";
    }
  }

  let summary = "";
  if (totalItems > 0) {
    if (!isEvidenceAvailable || !marketReach || marketReach.status === 'DATA_UNAVAILABLE') {
      summary = "Financial SWOT evaluation completed, but local evidence was unavailable to construct a full market picture.";
    } else {
      summary = "The current plan shows structured business economics, but local-market assumptions and downside resilience still require validation.";
    }
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
