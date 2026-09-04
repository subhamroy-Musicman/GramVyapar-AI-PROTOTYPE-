import { 
  EvidenceResult, 
  RadiusEvidence, 
  EvidenceItem, 
  EvidenceAvailability,
  EvidenceConfidence,
  ResolvedLocation,
  EnvironmentalContext,
  GeocodeStatus
} from '../../domain/evidence/types';
import { geocodeLocation } from './geocoding';
import { fetchOsmCandidates, OsmCandidate } from './osm';
import { fetchWeather } from './openmeteo';
import { calculateHaversineDistance } from '../geo/distance';
import { classifyPOI } from '../classification/poi';
import { EVIDENCE_CONFIG } from '../../config/evidence';

export async function buildEvidenceResult(villageTown: string, district: string, state: string): Promise<EvidenceResult & { geocodeStatus?: GeocodeStatus }> {
  const geocode = await geocodeLocation(villageTown, district, state);
  
  if (geocode.status !== 'SUCCESS' || !geocode.location) {
    return { ...createEmptyResult(), geocodeStatus: geocode.status };
  }

  const location = geocode.location;

  // Rule: Do not run OSM for STATE resolution level
  if (location.resolutionLevel === 'STATE') {
    return { ...createEmptyResult(), location, geocodeStatus: 'SUCCESS', availability: 'PROVIDER_UNAVAILABLE' };
  }

  const [osm5km, osm10km, weather] = await Promise.allSettled([
    fetchOsmCandidates(location.latitude, location.longitude, 5),
    fetchOsmCandidates(location.latitude, location.longitude, 10),
    fetchWeather(location.latitude, location.longitude)
  ]);

  const radius5km = buildRadiusEvidence(5, location.latitude, location.longitude, osm5km.status === 'fulfilled' ? osm5km.value : null);
  const radius10km = buildRadiusEvidence(10, location.latitude, location.longitude, osm10km.status === 'fulfilled' ? osm10km.value : null);
  
  let environment: EnvironmentalContext;
  if (weather.status === 'fulfilled' && weather.value) {
    environment = weather.value;
  } else {
    environment = {
      source: 'OPEN_METEO',
      providerAvailable: false,
      maxTemp: null,
      minTemp: null,
      precipitation: null
    };
  }

  const availability = calculateAvailability(radius5km, radius10km);
  const { dairySpecificConfidence, commercialEvidenceCoverage, competitiveSignal, salesChannelSignal, confidenceReason } = calculateConfidence(availability, radius5km, radius10km);

  return {
    location,
    radius5km,
    radius10km,
    environment,
    availability,
    dairySpecificConfidence,
    commercialEvidenceCoverage,
    competitiveSignal,
    salesChannelSignal,
    confidenceReason,
    geocodeStatus: 'SUCCESS',
    limitations: [
      "Mapped POIs may not represent all real-world businesses.",
      "Absence of mapped dairy businesses does not imply absence of competition.",
      "Mapped commercial activity is not equivalent to measured consumer demand."
    ]
  };
}

function deduplicateItems(items: EvidenceItem[]): EvidenceItem[] {
  const seenIds = new Set<string>();
  const output: EvidenceItem[] = [];

  for (const item of items) {
    if (seenIds.has(item.sourceId)) continue;
    
    // Name + distance deduplication (within 100 meters = 0.1km) to handle node/way duplicate representations of same physical entity
    if (item.name) {
      const isDuplicatePhysicalEntity = output.some(existing => 
        existing.name?.toLowerCase() === item.name?.toLowerCase() &&
        calculateHaversineDistance(item.latitude, item.longitude, existing.latitude, existing.longitude) < 0.1
      );
      if (isDuplicatePhysicalEntity) continue;
    }

    seenIds.add(item.sourceId);
    output.push(item);
  }
  return output;
}

function buildRadiusEvidence(radiusKm: 5 | 10, lat: number, lon: number, candidates: OsmCandidate[] | null): RadiusEvidence {
  if (!candidates) {
    return {
      radiusKm,
      providerAvailable: false,
      rawCandidateCount: 0,
      directDairySignals: [],
      potentialSalesChannels: [],
      supportInfrastructure: []
    };
  }

  const directDairySignals: EvidenceItem[] = [];
  const potentialSalesChannels: EvidenceItem[] = [];
  const supportInfrastructure: EvidenceItem[] = [];

  for (const c of candidates) {
    const classification = classifyPOI(c);
    if (!classification.category) continue;

    const distance = calculateHaversineDistance(lat, lon, c.latitude, c.longitude);
    if (distance > radiusKm) continue;

    const item: EvidenceItem = {
      source: 'OPENSTREETMAP',
      sourceId: c.id,
      name: c.name,
      latitude: c.latitude,
      longitude: c.longitude,
      distanceKm: distance,
      category: classification.category,
      classificationReason: classification.classificationReason,
      matchedTerm: classification.matchedTerm,
      relevantTags: c.tags
    };

    if (item.category === 'DIRECT_DAIRY_SIGNAL') directDairySignals.push(item);
    if (item.category === 'POTENTIAL_SALES_CHANNEL') potentialSalesChannels.push(item);
    if (item.category === 'SUPPORT_INFRASTRUCTURE') supportInfrastructure.push(item);
  }

  return {
    radiusKm,
    providerAvailable: true,
    rawCandidateCount: candidates.length,
    directDairySignals: deduplicateItems(directDairySignals),
    potentialSalesChannels: deduplicateItems(potentialSalesChannels),
    supportInfrastructure: deduplicateItems(supportInfrastructure)
  };
}

function calculateAvailability(r5: RadiusEvidence, r10: RadiusEvidence): EvidenceAvailability {
  if (!r5.providerAvailable && !r10.providerAvailable) {
    return 'PROVIDER_UNAVAILABLE';
  }

  // Use the widest successful radius for checking if any data exists. 
  // If r10 failed but r5 succeeded, check r5. If r10 succeeded, it inherently covers r5 area.
  const activeRadius = r10.providerAvailable ? r10 : r5;

  const totalDirect = activeRadius.directDairySignals.length;
  const totalSales = activeRadius.potentialSalesChannels.length;
  const totalSupport = activeRadius.supportInfrastructure.length;

  if (totalDirect > 0 || totalSales > 0 || totalSupport > 0) {
    return 'AVAILABLE';
  }

  return 'INSUFFICIENT';
}

function calculateConfidence(
  availability: EvidenceAvailability, 
  r5: RadiusEvidence, 
  r10: RadiusEvidence
): { dairySpecificConfidence: EvidenceConfidence, commercialEvidenceCoverage: EvidenceConfidence, competitiveSignal: 'OBSERVED' | 'LIMITED' | 'INSUFFICIENT', salesChannelSignal: 'OBSERVED' | 'LIMITED' | 'INSUFFICIENT', confidenceReason: string } {
  
  if (availability === 'PROVIDER_UNAVAILABLE') {
    return {
      dairySpecificConfidence: 'INSUFFICIENT',
      commercialEvidenceCoverage: 'INSUFFICIENT',
      competitiveSignal: 'INSUFFICIENT',
      salesChannelSignal: 'INSUFFICIENT',
      confidenceReason: 'Evidence providers could not be reached. Competitive activity cannot be characterized from available mapped data.'
    };
  }

  if (availability === 'INSUFFICIENT') {
    let missingReason = 'No meaningful dairy-specific mapped evidence was found in the queried OpenStreetMap data.';
    if (!r5.providerAvailable) {
      missingReason = '10 km mapped evidence is available, but the 5 km provider request failed, so immediate local-area evidence is incomplete. No meaningful evidence found in 10 km.';
    }
    return {
      dairySpecificConfidence: 'INSUFFICIENT',
      commercialEvidenceCoverage: 'INSUFFICIENT',
      competitiveSignal: 'INSUFFICIENT',
      salesChannelSignal: 'INSUFFICIENT',
      confidenceReason: missingReason
    };
  }

  const activeRadius = r10.providerAvailable ? r10 : r5;
  const totalDirect = activeRadius.directDairySignals.length;
  const totalCommercial = activeRadius.potentialSalesChannels.length + activeRadius.supportInfrastructure.length;

  // Dairy-specific confidence
  let dairySpecificConfidence: EvidenceConfidence = 'INSUFFICIENT';
  if (totalDirect >= EVIDENCE_CONFIG.thresholds.HIGH_DIRECT_SIGNALS) {
    dairySpecificConfidence = 'HIGH';
  } else if (totalDirect >= EVIDENCE_CONFIG.thresholds.MEDIUM_DIRECT_SIGNALS) {
    dairySpecificConfidence = 'MEDIUM';
  } else if (totalDirect > 0) {
    dairySpecificConfidence = 'LOW';
  }

  // Generic commercial evidence coverage
  let commercialEvidenceCoverage: EvidenceConfidence = 'INSUFFICIENT';
  if (totalCommercial >= 10) {
    commercialEvidenceCoverage = 'HIGH';
  } else if (totalCommercial >= EVIDENCE_CONFIG.thresholds.MEDIUM_TOTAL_COMMERCIAL) {
    commercialEvidenceCoverage = 'MEDIUM';
  } else if (totalCommercial >= EVIDENCE_CONFIG.thresholds.LOW_TOTAL_COMMERCIAL) {
    commercialEvidenceCoverage = 'LOW';
  }
  
  // Competitive signal (Deterministic cautious representation)
  let competitiveSignal: 'OBSERVED' | 'LIMITED' | 'INSUFFICIENT' = 'INSUFFICIENT';
  if (totalDirect >= EVIDENCE_CONFIG.thresholds.HIGH_DIRECT_SIGNALS) {
    competitiveSignal = 'OBSERVED';
  } else if (totalDirect >= 1) {
    competitiveSignal = 'LIMITED';
  }

  // Sales channel signal
  let salesChannelSignal: 'OBSERVED' | 'LIMITED' | 'INSUFFICIENT' = 'INSUFFICIENT';
  if (activeRadius.potentialSalesChannels.length >= EVIDENCE_CONFIG.thresholds.MEDIUM_TOTAL_COMMERCIAL) {
    salesChannelSignal = 'OBSERVED';
  } else if (activeRadius.potentialSalesChannels.length >= 1) {
    salesChannelSignal = 'LIMITED';
  }

  let confidenceReason = 'Mapped evidence successfully evaluated.';
  if (!r5.providerAvailable && r10.providerAvailable) {
    confidenceReason = '10 km mapped evidence is available, but the 5 km provider request failed, so immediate local-area evidence is incomplete.';
  }

  return {
    dairySpecificConfidence,
    commercialEvidenceCoverage,
    competitiveSignal,
    salesChannelSignal,
    confidenceReason
  };
}

// DUMMY TO KEEP EXISTING STEP 4 COMPILED WITHOUT MODIFICATION
import { LiveEvidence } from '@/types/evidence';
export async function gatherLiveEvidence(village: string, district: string, state: string): Promise<LiveEvidence> {
  return {
    geocode: null,
    marketReach: null,
    competitorSignal: null,
    veterinaryAccess: null,
    weatherRisk: null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function createEmptyResult(): EvidenceResult {
  return {
    location: null,
    radius5km: null,
    radius10km: null,
    environment: {
      source: 'OPEN_METEO',
      providerAvailable: false,
      maxTemp: null,
      minTemp: null,
      precipitation: null
    },
    availability: 'PROVIDER_UNAVAILABLE',
    dairySpecificConfidence: 'INSUFFICIENT',
    commercialEvidenceCoverage: 'INSUFFICIENT',
    competitiveSignal: 'INSUFFICIENT',
    salesChannelSignal: 'INSUFFICIENT',
    confidenceReason: 'Location could not be resolved. Competitive activity cannot be characterized from available mapped data.',
    limitations: []
  };
}

