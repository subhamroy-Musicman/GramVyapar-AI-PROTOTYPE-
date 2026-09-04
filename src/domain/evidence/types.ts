
export type EvidenceAvailability = 'AVAILABLE' | 'INSUFFICIENT' | 'PROVIDER_UNAVAILABLE';

export type EvidenceConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';

export type EvidenceCategory = 'DIRECT_DAIRY_SIGNAL' | 'POTENTIAL_SALES_CHANNEL' | 'SUPPORT_INFRASTRUCTURE';

export interface EntrepreneurLocation {
  villageTown: string;
  district: string;
  state: string;
}

export type LocationResolutionLevel = 
  | 'LOCALITY'
  | 'DISTRICT'
  | 'STATE'
  | 'DEVICE_LOCATION'
  | 'MANUAL_COORDINATE'
  | 'UNRESOLVED';

export interface ResolvedLocation {
  originalInput: string;
  resolvedDisplayName: string;
  latitude: number;
  longitude: number;
  source: 'NOMINATIM';
  resolutionLevel: LocationResolutionLevel;
}

export type GeocodeStatus = 
  | 'SUCCESS'
  | 'AMBIGUOUS_LOCATION'
  | 'NOT_FOUND'
  | 'PROVIDER_FAILURE';

export interface AmbiguousLocationResult {
  status: 'AMBIGUOUS_LOCATION';
  candidates: ResolvedLocation[];
}

export interface GeocodeResult {
  status: GeocodeStatus;
  location?: ResolvedLocation;
  candidates?: ResolvedLocation[];
}

export interface EvidenceItem {
  source: 'OPENSTREETMAP';
  sourceId: string;
  name: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
  category: EvidenceCategory;
  classificationReason: string;
  matchedTerm: string | null;
  relevantTags: Record<string, string>;
}

export interface RadiusEvidence {
  radiusKm: 5 | 10;
  providerAvailable: boolean;
  rawCandidateCount: number;
  directDairySignals: EvidenceItem[];
  potentialSalesChannels: EvidenceItem[];
  supportInfrastructure: EvidenceItem[];
}

export interface EnvironmentalContext {
  source: 'OPEN_METEO';
  providerAvailable: boolean;
  maxTemp: number | null;
  minTemp: number | null;
  precipitation: number | null;
}

export interface EvidenceResult {
  location: ResolvedLocation | null;
  radius5km: RadiusEvidence | null;
  radius10km: RadiusEvidence | null;
  environment: EnvironmentalContext;
  
  // 1. DATA COVERAGE / EVIDENCE COVERAGE
  availability: EvidenceAvailability;
  
  // 2. EVIDENCE SIGNAL STRENGTH
  dairySpecificConfidence: EvidenceConfidence;
  commercialEvidenceCoverage: EvidenceConfidence;
  
  // 3. COMPETITIVE SIGNAL
  competitiveSignal: 'OBSERVED' | 'LIMITED' | 'INSUFFICIENT';
  
  // 4. SALES-CHANNEL SIGNAL
  salesChannelSignal: 'OBSERVED' | 'LIMITED' | 'INSUFFICIENT';

  confidenceReason: string;
  limitations: string[];
}
