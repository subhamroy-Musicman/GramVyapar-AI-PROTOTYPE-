export type SourceType = 'live-api' | 'government-data' | 'user-input' | 'prototype-assumption';
export type Confidence = 'high' | 'medium' | 'low';
export type GeographyLevel = 'radius' | 'village' | 'block' | 'district' | 'state' | 'national' | 'point';

export interface EvidenceItem {
  id: string;
  category: string;
  label: string;
  value: any;
  source: string;
  sourceType: SourceType;
  confidence: Confidence;
  geographyLevel: GeographyLevel;
  retrievedAt: string;
  caveat?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  source: string;
  confidence: Confidence;
}

export interface POIResult {
  id: number;
  name: string;
  type: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  osmTags: Record<string, string>;
}

export interface WeatherResult {
  currentTemp: number;
  maxTemp: number;
  precipitation: number;
  conditions: string;
  isHeatStressRisk: boolean;
  isLogisticsRisk: boolean;
}

export interface LiveEvidence {
  geocode: GeocodeResult | null;
  marketReach: EvidenceItem | null;
  competitorSignal: EvidenceItem | null;
  veterinaryAccess: EvidenceItem | null;
  weatherRisk: EvidenceItem | null;
}
