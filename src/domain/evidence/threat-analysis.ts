import { FinancialAssessment } from "../finance/types";
import { StressAssessment } from "../stress/types";
import { DecisionResult } from "../decision/types";
import { EvidenceResult } from "./types";
import { MarketReachResult } from "./market-reach";
import { OpportunityAnalysisResult } from "./opportunity-analysis";
import { formatCurrency } from "../../lib/utils/formatters";

export type ThreatCategory =
  | "PRODUCTION"
  | "INPUT_COST"
  | "FINANCING"
  | "MARKET"
  | "SUPPLY_CHAIN"
  | "BUYER_DEPENDENCY"
  | "INFRASTRUCTURE"
  | "EVIDENCE_UNCERTAINTY"
  | "SEASONALITY";

export type ThreatSeverity = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type ThreatConfidence = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
export type ThreatSourceType =
  | "STRESS_RESULT"
  | "CALCULATED_RESULT"
  | "LOCAL_EVIDENCE"
  | "USER_INPUT"
  | "OPPORTUNITY_HYPOTHESIS"
  | "PROTOTYPE_ASSUMPTION";

export interface ThreatItem {
  id: string;
  category: ThreatCategory;
  title: string;
  description: string;
  sourceType: ThreatSourceType;
  sourceDetail: string;
  affectedArea: string[];
  severity: ThreatSeverity;
  confidence: ThreatConfidence;
  notVerified: string[];
  mitigationAction: string;
}

export interface ThreatAnalysisResult {
  status: "AVAILABLE" | "LIMITED" | "INSUFFICIENT_DATA";
  threats: ThreatItem[];
  overallConfidence: ThreatConfidence;
  limitations: string[];
  summary: string;
}

export function calculateThreatAnalysis(
  financial: FinancialAssessment,
  stress: StressAssessment,
  decision: DecisionResult,
  evidence: EvidenceResult | null | 'UNAVAILABLE',
  marketReach: MarketReachResult | null,
  opportunityAnalysis: OpportunityAnalysisResult | null
): ThreatAnalysisResult {
  
  const threats: ThreatItem[] = [];
  const limitations: string[] = [];
  
  const isEvidenceAvailable = evidence && evidence !== 'UNAVAILABLE' && (evidence as EvidenceResult).availability !== 'PROVIDER_UNAVAILABLE';
  const ev = isEvidenceAvailable ? (evidence as EvidenceResult) : null;
  const isDistrictFallback = ev?.location?.resolutionLevel === 'DISTRICT' || ev?.location?.resolutionLevel === 'STATE';

  // 1 & 2. PRODUCTION & INPUT COST (from Stress)
  const baseCash = financial.cashFlow.postNewLoanRepaymentCash;
  const stressCash = stress.stressed.cashFlow.postNewLoanRepaymentCash;
  
  if (stressCash < baseCash) {
    let severity: ThreatSeverity = "MEDIUM";
    if (stressCash <= 0 || decision.status === 'HIGH_RISK') {
      severity = "HIGH";
    }

    const stressSourceDetail = `The prototype stress case combines lower milk yield (-20%) and higher feed cost (+15%). Post-repayment cash falls to ${formatCurrency(stressCash)}.`;

    threats.push({
      id: "THREAT_PRODUCTION_YIELD",
      category: "PRODUCTION",
      title: "Milk-yield reduction risk",
      description: "The current stress scenario shows that lower milk yield reduces business cash generation and repayment resilience.",
      sourceType: "STRESS_RESULT",
      sourceDetail: stressSourceDetail,
      affectedArea: ["Revenue", "Operating Surplus", "Debt Repayment Capacity"],
      severity,
      confidence: "HIGH",
      notVerified: [
        "actual probability of 20% yield decline",
        "duration of the decline",
        "animal-specific health outcomes"
      ],
      mitigationAction: "Validate realistic milk-yield assumptions using local dairy records or experienced farmers and maintain adequate operating buffer."
    });

    threats.push({
      id: "THREAT_INPUT_FEED",
      category: "INPUT_COST",
      title: "Feed-cost inflation risk",
      description: "Higher feed costs can reduce operating surplus and repayment buffer.",
      sourceType: "STRESS_RESULT",
      sourceDetail: stressSourceDetail,
      affectedArea: ["Operating Cost", "Operating Surplus", "Cash Buffer"],
      severity,
      confidence: "HIGH",
      notVerified: [
        "current local feed-price trend",
        "future feed inflation",
        "supplier-specific price changes"
      ],
      mitigationAction: "Obtain current quotations from multiple feed suppliers and test whether the business remains viable at higher feed prices."
    });
  }

  // 3. FINANCING RISK
  const hasFinancingPressure = 
    stressCash <= 0 || 
    baseCash <= 0 || 
    decision.reasonCodes.includes("EXISTING_DEBT_PRESSURE") ||
    decision.reasonCodes.includes("STRESS_EXISTING_DEBT_PRESSURE") ||
    decision.reasonCodes.includes("STRESS_RESILIENCE_THIN") ||
    decision.reasonCodes.includes("FINANCING_OUTSIDE_PROTOTYPE_RANGE");

  if (hasFinancingPressure) {
    let severity: ThreatSeverity = "MEDIUM";
    if (stressCash <= 0 || baseCash <= 0 || decision.status === 'HIGH_RISK') {
      severity = "HIGH";
    }

    threats.push({
      id: "THREAT_FINANCING",
      category: "FINANCING",
      title: "Repayment-pressure risk",
      description: "Under the current financing structure, adverse operating conditions can reduce the cash available after scheduled repayment.",
      sourceType: "CALCULATED_RESULT",
      sourceDetail: `Calculated based on funding gap of ${formatCurrency(financial.funding.fundingGap)} and modeled cash flow obligations.`,
      affectedArea: ["Debt Repayment", "Working Capital", "Cash Flow"],
      severity,
      confidence: "HIGH",
      notVerified: [
        "actual loan terms offered by local banks",
        "flexibility of repayment schedules",
        "interest rate fluctuations"
      ],
      mitigationAction: "Compare a lower borrowing requirement, lower-cost financing, or a smaller project scale before taking debt."
    });
  }

  // 4. EVIDENCE UNCERTAINTY
  let evidenceConfidenceLevel: ThreatConfidence = "INSUFFICIENT";
  if (ev) {
    evidenceConfidenceLevel = ev.commercialEvidenceCoverage;
    if (isDistrictFallback) {
      evidenceConfidenceLevel = "LOW";
    }
  }

  if (!isEvidenceAvailable || evidenceConfidenceLevel === 'LOW' || evidenceConfidenceLevel === 'INSUFFICIENT' || isDistrictFallback) {
    threats.push({
      id: "THREAT_EVIDENCE_UNCERTAINTY",
      category: "EVIDENCE_UNCERTAINTY",
      title: "Local-market evidence uncertainty",
      description: "Available mapped evidence may not fully represent businesses, buyers or support services in the selected village.",
      sourceType: "LOCAL_EVIDENCE",
      sourceDetail: !isEvidenceAvailable ? "Map provider data is currently unavailable." : (isDistrictFallback ? "Evidence relies on district-level fallback data rather than village-level precision." : "Sparse commercial map data limits deterministic market visibility."),
      affectedArea: ["Market Demand", "Competitive Landscape", "Support Services"],
      severity: !isEvidenceAvailable ? "UNKNOWN" : (evidenceConfidenceLevel === 'INSUFFICIENT' ? "MEDIUM" : "LOW"),
      confidence: !isEvidenceAvailable ? "INSUFFICIENT" : evidenceConfidenceLevel,
      notVerified: [
        "unmapped businesses",
        "informal competitors",
        "actual buyer demand",
        isDistrictFallback ? "village-level conditions" : "recent local market changes"
      ],
      mitigationAction: "Perform a local field check before relying on mapped evidence for the final investment decision."
    });
  }

  // 5. SUPPORT INFRASTRUCTURE RISK
  if (isEvidenceAvailable && marketReach && evidenceConfidenceLevel !== 'LOW' && evidenceConfidenceLevel !== 'INSUFFICIENT') {
    if (marketReach.radius10km.supportInfrastructure === 0) {
      threats.push({
        id: "THREAT_INFRASTRUCTURE",
        category: "INFRASTRUCTURE",
        title: "Support infrastructure risk",
        description: "Few mapped support-infrastructure signals were found in the current data.",
        sourceType: "LOCAL_EVIDENCE",
        sourceDetail: "0 relevant support facilities identified within a 10km radius.",
        affectedArea: ["Animal Health", "Operational Continuity"],
        severity: "MEDIUM",
        confidence: evidenceConfidenceLevel,
        notVerified: [
          "unmapped local services",
          "informal/private service availability",
          "actual operating hours",
          "service cost"
        ],
        mitigationAction: "Confirm veterinary/support-service availability, travel time and cost before investment."
      });
    }
  }

  // LIMITATIONS (No seasonality, buyer dependency, supply chain fabricated)
  limitations.push("Threats are based on current user-entered assumptions.");
  limitations.push("Stress scenario uses predefined prototype shocks.");
  limitations.push("Actual probability of the stress scenario is not predicted.");
  limitations.push("Seasonality is not currently measured.");
  limitations.push("Buyer concentration is not currently measured.");
  limitations.push("Supplier concentration is not currently measured.");

  if (!isEvidenceAvailable || !marketReach || marketReach.status === 'DATA_UNAVAILABLE') {
    limitations.push("Local evidence is unavailable, so location-specific operational threats could not be assessed.");
  } else {
    if (marketReach.consumerBase.status === 'DATA_UNAVAILABLE') {
      limitations.push("Consumer population is unavailable.");
    }
    if (marketReach.status === 'LIMITED') {
      limitations.push("Local map data may be incomplete.");
    }
  }

  // STATUS & OVERALL CONFIDENCE & SUMMARY
  let status: "AVAILABLE" | "LIMITED" | "INSUFFICIENT_DATA" = "AVAILABLE";
  if (!isEvidenceAvailable || !marketReach || marketReach.status === 'DATA_UNAVAILABLE') {
    status = "LIMITED";
  }

  let overallConfidence: ThreatConfidence = "LOW";
  if (isEvidenceAvailable && !isDistrictFallback && ev?.commercialEvidenceCoverage !== 'INSUFFICIENT') {
    overallConfidence = "MEDIUM";
  }

  let summary = "";
  if (!isEvidenceAvailable || !marketReach || marketReach.status === 'DATA_UNAVAILABLE') {
    summary = "Financial and stress risks can be evaluated, but local operational threats cannot be assessed with high confidence.";
  } else {
    summary = "The primary modelled risks are production/input-cost stress and repayment resilience. Local-market evidence remains partially uncertain and requires field validation.";
  }

  return {
    status,
    threats,
    overallConfidence,
    limitations,
    summary
  };
}
