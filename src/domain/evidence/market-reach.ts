import { EvidenceResult, EvidenceItem, LocationResolutionLevel } from './types';

export type MarketReachStatus = "AVAILABLE" | "LIMITED" | "DATA_UNAVAILABLE";
export type ConsumerBaseStatus = "AVAILABLE" | "DATA_UNAVAILABLE";

export interface MarketRadiusSummary {
  radiusKm: 5 | 10;
  directBusinessSignals: number;
  potentialSalesChannels: number;
  supportInfrastructure: number;
  totalMappedSignals: number;
}

export interface DistributionChannelSummary {
  id: string;
  label: string;
  count5km: number;
  count10km: number;
  evidenceBasis: "MAPPED_POI" | "DERIVED_FROM_MAPPED_POI";
}

export interface ConsumerBaseResult {
  status: ConsumerBaseStatus;
  estimatedPopulation: number | null;
  source: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  message: string;
}

export interface MarketReachResult {
  status: MarketReachStatus;
  locationLabel: string;
  locationPrecision: LocationResolutionLevel;
  radius5km: MarketRadiusSummary;
  radius10km: MarketRadiusSummary;
  distributionChannels: DistributionChannelSummary[];
  consumerBase: ConsumerBaseResult;
  evidenceConfidence: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  limitations: string[];
  validationActions: string[];
}

export function calculateMarketReach(evidence: EvidenceResult): MarketReachResult {
  let status: MarketReachStatus = "AVAILABLE";
  if (!evidence.radius5km?.providerAvailable && !evidence.radius10km?.providerAvailable) {
    status = "DATA_UNAVAILABLE";
  } else if (evidence.availability === 'INSUFFICIENT' || evidence.location?.resolutionLevel !== 'LOCALITY' || !evidence.radius5km?.providerAvailable || !evidence.radius10km?.providerAvailable) {
    status = "LIMITED";
  }

  const buildRadiusSummary = (radiusEvidence: any, radiusKm: 5 | 10): MarketRadiusSummary => {
    if (!radiusEvidence) {
      return {
        radiusKm,
        directBusinessSignals: 0,
        potentialSalesChannels: 0,
        supportInfrastructure: 0,
        totalMappedSignals: 0
      };
    }
    const directDairySignals = radiusEvidence.directDairySignals || [];
    const potentialSalesChannels = radiusEvidence.potentialSalesChannels || [];
    const supportInfrastructure = radiusEvidence.supportInfrastructure || [];

    return {
      radiusKm,
      directBusinessSignals: directDairySignals.length,
      potentialSalesChannels: potentialSalesChannels.length,
      supportInfrastructure: supportInfrastructure.length,
      totalMappedSignals: directDairySignals.length + potentialSalesChannels.length + supportInfrastructure.length
    };
  };

  const r5 = buildRadiusSummary(evidence.radius5km, 5);
  const r10 = buildRadiusSummary(evidence.radius10km, 10);

  const getChannels = (): DistributionChannelSummary[] => {
    const c5 = [...(evidence.radius5km?.potentialSalesChannels || []), ...(evidence.radius5km?.directDairySignals || [])];
    const c10 = [...(evidence.radius10km?.potentialSalesChannels || []), ...(evidence.radius10km?.directDairySignals || [])];
    
    const channels: DistributionChannelSummary[] = [];

    const countAndAdd = (id: string, label: string, filter: (item: EvidenceItem) => boolean) => {
      const cnt5 = c5.filter(filter).length;
      const cnt10 = c10.filter(filter).length;
      if (cnt5 > 0 || cnt10 > 0) {
        channels.push({
          id, label, count5km: cnt5, count10km: cnt10, evidenceBasis: "MAPPED_POI"
        });
      }
    };

    countAndAdd('supermarket', 'Supermarkets', i => i.relevantTags?.shop === 'supermarket');
    countAndAdd('grocery', 'Grocery & Convenience', i => ['grocery', 'general', 'convenience'].includes(i.relevantTags?.shop || ''));
    countAndAdd('marketplace', 'Local Markets', i => i.relevantTags?.amenity === 'marketplace');
    countAndAdd('dairy_outlet', 'Dairy Retail Outlets', i => i.category === 'DIRECT_DAIRY_SIGNAL');

    return channels;
  };

  const consumerBase: ConsumerBaseResult = {
    status: "DATA_UNAVAILABLE",
    estimatedPopulation: null,
    source: null,
    confidence: "INSUFFICIENT",
    message: "Reliable consumer population data is not currently available for this selected market area."
  };

  const limitations: string[] = [
    "Mapped businesses may be incomplete.",
    "Absence of mapped businesses does not prove absence of competition.",
    "POI counts do not measure actual consumer demand.",
    "POI counts do not measure purchasing power.",
    "Consumer population data is unavailable."
  ];

  if (evidence.location && evidence.location.resolutionLevel !== 'LOCALITY') {
    limitations.push("Evidence is district-level rather than village-level.");
  }
  if ((evidence.radius5km && !evidence.radius5km.providerAvailable) || (evidence.radius10km && !evidence.radius10km.providerAvailable)) {
    limitations.push("Provider returned partial data.");
  }

  const validationActions: string[] = [
    "Verify local household/customer volume through Panchayat, Census, or field survey data before final investment."
  ];

  if (r10.totalMappedSignals < 5) {
    validationActions.push("Visit the selected market area and verify unregistered/unmapped competitors.");
  }
  if (r10.potentialSalesChannels > 0) {
    validationActions.push("Speak with nearby mapped retailers/buyers to validate actual purchase volume and price.");
  }
  if (evidence.location && evidence.location.resolutionLevel !== 'LOCALITY') {
    validationActions.push("Validate conditions within the actual village before relying on district-level evidence.");
  }

  return {
    status,
    locationLabel: evidence.location?.resolvedDisplayName || "Unknown Location",
    locationPrecision: evidence.location?.resolutionLevel || "UNRESOLVED",
    radius5km: r5,
    radius10km: r10,
    distributionChannels: getChannels(),
    consumerBase,
    evidenceConfidence: evidence.commercialEvidenceCoverage,
    limitations,
    validationActions
  };
}
