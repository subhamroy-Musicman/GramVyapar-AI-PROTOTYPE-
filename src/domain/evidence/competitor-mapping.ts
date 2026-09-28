import { EvidenceResult, EvidenceItem, EvidenceConfidence } from "./types";

export type CompetitorMappingStatus =
  | "AVAILABLE"
  | "LIMITED"
  | "DATA_UNAVAILABLE";

export type CompetitorConfidence = EvidenceConfidence;

export interface MappedCompetitorSignal {
  id: string;
  name: string | null;
  entityType: "DAIRY_BUSINESS_SIGNAL";
  distanceKm: number | null;
  latitude?: number;
  longitude?: number;
  osmTags?: Record<string, string>;
  source: "OPENSTREETMAP";
  isConfirmedCompetitor: false;
}

export interface CompetitorRadiusSummary {
  radiusKm: 5 | 10;
  mappedSimilarBusinessSignals: number;
  namedEntities: number;
  unnamedEntities: number;
}

export interface CompetitorMappingResult {
  status: CompetitorMappingStatus;
  locationLabel: string;
  locationPrecision: "LOCALITY" | "DISTRICT" | "STATE" | "UNKNOWN";
  radius5km: CompetitorRadiusSummary | null;
  radius10km: CompetitorRadiusSummary | null;
  entities: MappedCompetitorSignal[];
  evidenceConfidence: CompetitorConfidence;
  interpretation: string;
  limitations: string[];
  validationActions: string[];
}

export function calculateCompetitorMapping(evidence: EvidenceResult | null | "UNAVAILABLE"): CompetitorMappingResult {
  const isAvailable = evidence && evidence !== "UNAVAILABLE" && evidence.availability !== "PROVIDER_UNAVAILABLE";
  
  if (!isAvailable) {
    return {
      status: "DATA_UNAVAILABLE",
      locationLabel: "Unknown Location",
      locationPrecision: "UNKNOWN",
      radius5km: null,
      radius10km: null,
      entities: [],
      evidenceConfidence: "INSUFFICIENT",
      interpretation: "Competitor mapping could not be completed because local map evidence is unavailable.",
      limitations: ["Missing mapped entities do not prove absence of competition."],
      validationActions: ["Perform a manual local-market competitor check before investment."]
    };
  }

  const ev = evidence as EvidenceResult;
  const locationLabel = ev.location?.resolvedDisplayName || "Selected Location";
  const locationPrecision = (ev.location?.resolutionLevel as any) || "UNKNOWN";
  
  const r5 = ev.radius5km;
  const r10 = ev.radius10km;

  let status: CompetitorMappingStatus = "AVAILABLE";
  if (!r5?.providerAvailable && !r10?.providerAvailable) {
    status = "DATA_UNAVAILABLE";
  } else if (!r5?.providerAvailable || !r10?.providerAvailable) {
    status = "LIMITED";
  }

  if (status === "DATA_UNAVAILABLE") {
    return {
      status,
      locationLabel,
      locationPrecision,
      radius5km: null,
      radius10km: null,
      entities: [],
      evidenceConfidence: "INSUFFICIENT",
      interpretation: "Mapped competitor/business evidence unavailable.",
      limitations: ["Missing mapped entities do not prove absence of competition."],
      validationActions: ["Perform a manual local-market competitor check before investment."]
    };
  }

  const buildRadiusSummary = (radius: 5 | 10, signals: EvidenceItem[] | undefined): CompetitorRadiusSummary | null => {
    if (!signals) return null;
    let named = 0;
    let unnamed = 0;
    signals.forEach(s => {
      if (s.name) named++;
      else unnamed++;
    });
    return {
      radiusKm: radius,
      mappedSimilarBusinessSignals: signals.length,
      namedEntities: named,
      unnamedEntities: unnamed
    };
  };

  const radius5km = r5?.providerAvailable ? buildRadiusSummary(5, r5.directDairySignals) : null;
  const radius10km = r10?.providerAvailable ? buildRadiusSummary(10, r10.directDairySignals) : null;

  // We use 10km as the primary source of entities, as it encompasses 5km natively in OSM logic.
  // If 10km is missing, fallback to 5km.
  const sourceSignals = r10?.providerAvailable ? (r10.directDairySignals || []) : (r5?.directDairySignals || []);
  
  const entities: MappedCompetitorSignal[] = sourceSignals.map(s => ({
    id: s.sourceId,
    name: s.name,
    entityType: "DAIRY_BUSINESS_SIGNAL" as const,
    distanceKm: s.distanceKm,
    latitude: s.latitude,
    longitude: s.longitude,
    osmTags: s.relevantTags,
    source: "OPENSTREETMAP" as const,
    isConfirmedCompetitor: false as const
  })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  let interpretation = "";
  let evidenceConfidence = ev.commercialEvidenceCoverage;

  if (locationPrecision === "DISTRICT" || locationPrecision === "STATE") {
    evidenceConfidence = "LOW"; // Downgrade confidence for fallback
  }

  if (entities.length > 0) {
    interpretation = "Mapped dairy-related businesses are present in the selected market area. These signals indicate local dairy activity but do not establish actual competitive intensity.";
  } else {
    interpretation = "No mapped dairy-related business signals were found in the current query. This does not prove that no competitors operate locally.";
  }

  const limitations = [
    "OpenStreetMap coverage may be incomplete.",
    "Informal/unregistered businesses may not be mapped.",
    "A mapped dairy-related entity is not automatically a direct competitor.",
    "Counts do not measure market share.",
    "Counts do not measure sales volume.",
    "Counts do not measure capacity.",
    "Counts do not establish market saturation.",
    "Missing mapped entities do not prove absence of competition."
  ];

  if (locationPrecision === "DISTRICT") {
    limitations.push("District-level fallback may not represent village conditions.");
  }

  const validationActions = [];
  
  if (entities.length > 0) {
    validationActions.push("Visit or call nearby mapped dairy businesses to understand product mix, pricing, sourcing and customer segments.");
  } else {
    validationActions.push("Verify unmapped and informal dairy businesses through local market visits before assuming competition is low.");
  }

  if (locationPrecision === "DISTRICT") {
    validationActions.push("Validate competitors inside the actual village because current evidence is district-level.");
  }

  return {
    status,
    locationLabel,
    locationPrecision,
    radius5km,
    radius10km,
    entities,
    evidenceConfidence,
    interpretation,
    limitations,
    validationActions
  };
}
