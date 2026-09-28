import { EvidenceResult } from "./types";
import { MarketReachResult } from "./market-reach";

export type OpportunityAnalysisStatus = "AVAILABLE" | "LIMITED" | "INSUFFICIENT_DATA";
export type OpportunityEvidenceBasis = 
  | "DIRECT_BUSINESS_SIGNAL"
  | "POTENTIAL_SALES_CHANNEL"
  | "SUPPORT_INFRASTRUCTURE"
  | "BUSINESS_ECONOMICS"
  | "MARKET_REACH"
  | "USER_INPUT";

export type OpportunityConfidence = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

export interface OpportunityEvidence {
  basis: OpportunityEvidenceBasis;
  description: string;
  sourceRadiusKm?: 5 | 10;
}

export interface OpportunityHypothesis {
  id: string;
  title: string;
  observation: string;
  hypothesis: string;
  evidence: OpportunityEvidence[];
  confidence: OpportunityConfidence;
  notVerified: string[];
  validationAction: string;
}

export interface OpportunityAnalysisResult {
  status: OpportunityAnalysisStatus;
  opportunities: OpportunityHypothesis[];
  overallConfidence: OpportunityConfidence;
  limitations: string[];
  summary: string;
}

export function calculateOpportunityAnalysis(
  evidence: EvidenceResult,
  marketReach: MarketReachResult
): OpportunityAnalysisResult {
  const r10 = marketReach.radius10km;
  const isDistrictFallback = evidence.location?.resolutionLevel === 'DISTRICT';
  
  if (marketReach.status === 'DATA_UNAVAILABLE' || r10.totalMappedSignals < 3) {
    return {
      status: "INSUFFICIENT_DATA",
      opportunities: [],
      overallConfidence: "INSUFFICIENT",
      summary: "Current mapped evidence is insufficient to identify a defensible local opportunity.",
      limitations: [
        "Mapped evidence is too sparse to form a reliable hypothesis.",
        "Informal or unregistered businesses may not appear on the map."
      ]
    };
  }

  const opportunities: OpportunityHypothesis[] = [];
  
  // Rule A: Sales Channel Access
  if (r10.potentialSalesChannels > 0) {
    opportunities.push({
      id: "SALES_CHANNEL_ACCESS",
      title: "Nearby sales-channel access",
      observation: "Mapped potential sales channels are present within the selected market area.",
      hypothesis: "Direct supply to nearby mapped retailers or buyers may be worth validating.",
      evidence: [{
        basis: "POTENTIAL_SALES_CHANNEL",
        description: `Found ${r10.potentialSalesChannels} potential sales channels mapped within 10km.`,
        sourceRadiusKm: 10
      }],
      confidence: isDistrictFallback ? "LOW" : "MEDIUM",
      notVerified: [
        "actual purchase volume",
        "existing supplier relationships",
        "purchase price",
        "willingness to onboard a new supplier"
      ],
      validationAction: "Speak with nearby mapped retailers/buyers and verify daily purchase volume, current supplier arrangements and purchase price."
    });
  }

  // Rule B: Direct Dairy Signals
  if (r10.directBusinessSignals > 0) {
    opportunities.push({
      id: "DAIRY_ECOSYSTEM_PRESENCE",
      title: "Local Dairy Ecosystem",
      observation: "Mapped dairy-related businesses/facilities exist in the selected market area.",
      hypothesis: "Existing dairy activity may indicate an established local dairy supply ecosystem worth studying.",
      evidence: [{
        basis: "DIRECT_BUSINESS_SIGNAL",
        description: `Found ${r10.directBusinessSignals} direct dairy-related signals mapped within 10km.`,
        sourceRadiusKm: 10
      }],
      confidence: isDistrictFallback ? "LOW" : "MEDIUM",
      notVerified: [
        "market saturation",
        "competitor sales volume",
        "unmapped competitors",
        "actual ecosystem viability"
      ],
      validationAction: "Visit nearby dairy-related businesses to understand product mix, pricing, supply sources and buyer relationships."
    });
  }

  // Rule C: Channels Present + Sparse Direct Signals
  if (r10.potentialSalesChannels > 0 && r10.directBusinessSignals <= 2) {
    opportunities.push({
      id: "SPARSE_MAPPED_COMPETITION",
      title: "Potential Sourcing Gap",
      observation: "Mapped sales-channel signals are present while relatively few dairy-specific entities were found in the current map data.",
      hypothesis: "This pattern may justify field research into whether some nearby buyers have unmet sourcing needs.",
      evidence: [
        {
          basis: "POTENTIAL_SALES_CHANNEL",
          description: `Found ${r10.potentialSalesChannels} potential sales channels.`,
          sourceRadiusKm: 10
        },
        {
          basis: "DIRECT_BUSINESS_SIGNAL",
          description: `Only ${r10.directBusinessSignals} direct dairy signals mapped.`,
          sourceRadiusKm: 10
        }
      ],
      confidence: "LOW", // High risk for overclaiming, keep confidence LOW
      notVerified: [
        "unmapped dairy businesses",
        "informal suppliers",
        "actual unmet demand",
        "buyer purchase volume"
      ],
      validationAction: "Verify unmapped competitors and ask nearby buyers whether current supply already meets their needs."
    });
  }

  // Rule D: Support Infrastructure
  if (r10.supportInfrastructure > 0) {
    opportunities.push({
      id: "SUPPORT_INFRASTRUCTURE_ACCESS",
      title: "Support Infrastructure Access",
      observation: "Mapped support infrastructure relevant to dairy operations exists within the selected market area.",
      hypothesis: "Nearby support services may reduce operational friction and are worth evaluating before investment.",
      evidence: [{
        basis: "SUPPORT_INFRASTRUCTURE",
        description: `Found ${r10.supportInfrastructure} support infrastructure entities mapped within 10km.`,
        sourceRadiusKm: 10
      }],
      confidence: isDistrictFallback ? "LOW" : "MEDIUM",
      notVerified: [
        "service quality",
        "actual costs",
        "operating hours",
        "capacity to serve new businesses"
      ],
      validationAction: "Verify service availability, distance, pricing and operating hours before relying on the infrastructure."
    });
  }

  const limitations = [
    "Opportunity hypotheses rely strictly on observable map data and are not guaranteed business outcomes.",
    "Absence of mapped direct competitors does not confirm low competition.",
    "Presence of potential sales channels does not confirm high demand.",
    "Unmapped, informal, or unregistered businesses are not accounted for."
  ];

  if (isDistrictFallback) {
    limitations.push("Evidence is district-level; village-level conditions may vary significantly.");
  }

  const status: OpportunityAnalysisStatus = (opportunities.length > 0 && evidence.availability === 'AVAILABLE' && !isDistrictFallback) ? "AVAILABLE" : "LIMITED";
  
  // Overall confidence is intentionally decoupled from Evidence Confidence.
  // Opportunity hypotheses inherently require unverified assumptions, so confidence is generally capped at MEDIUM.
  let overallConfidence: OpportunityConfidence = "LOW";
  if (status === "AVAILABLE" && r10.totalMappedSignals > 10) {
    overallConfidence = "MEDIUM";
  }

  return {
    status,
    opportunities,
    overallConfidence,
    limitations,
    summary: opportunities.length > 0 
      ? `Generated ${opportunities.length} local opportunity hypotheses requiring field validation.`
      : "Current mapped evidence is insufficient to identify a defensible local opportunity."
  };
}
