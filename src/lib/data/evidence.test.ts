import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gatherLiveEvidence } from './evidence';
import * as osm from './osm';
import * as geocoding from './geocoding';
import * as weather from './weather';
import { GeocodeResult, POIResult } from '@/types/evidence';

vi.mock('./osm');
vi.mock('./geocoding');
vi.mock('./weather');

describe('evidence normalization and thresholds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(geocoding.geocodeLocation).mockResolvedValue({ latitude: 10, longitude: 20 } as GeocodeResult);
    vi.mocked(weather.fetchWeather).mockResolvedValue(null);
  });

  it('normalizes competitor signal thresholds in 5km and 10km zones', async () => {
    // High (9+ in 10km)
    vi.mocked(osm.fetchOSMData).mockResolvedValue(
      Array.from({ length: 10 }).map((_, i) => ({ id: i, type: 'dairy_business', distanceKm: 8, osmTags: { shop: 'dairy' } } as unknown as POIResult))
    );
    let result = await gatherLiveEvidence('Village', 'District', 'State');
    expect(result.competitorSignal?.value.signal).toBe('High mapped signal');
    expect(result.competitorSignal?.value.zone5).toBe(0);
    expect(result.competitorSignal?.value.zone10).toBe(10);
    expect(result.competitorSignal?.confidence).toBe('high');

    // Moderate (4-8 in 10km)
    vi.mocked(osm.fetchOSMData).mockResolvedValue(
      Array.from({ length: 5 }).map((_, i) => ({ id: i, type: 'dairy_cooperative', distanceKm: 4, osmTags: {} } as unknown as POIResult))
    );
    result = await gatherLiveEvidence('Village', 'District', 'State');
    expect(result.competitorSignal?.value.signal).toBe('Moderate mapped signal');
    expect(result.competitorSignal?.value.zone5).toBe(5);
    expect(result.competitorSignal?.confidence).toBe('medium');

    // Low (1-3 in 10km)
    vi.mocked(osm.fetchOSMData).mockResolvedValue([
      { id: 1, type: 'dairy_business', distanceKm: 3, osmTags: {} } as unknown as POIResult
    ]);
    result = await gatherLiveEvidence('Village', 'District', 'State');
    expect(result.competitorSignal?.value.signal).toBe('Low mapped signal');

    // Insufficient (0)
    vi.mocked(osm.fetchOSMData).mockResolvedValue([]);
    result = await gatherLiveEvidence('Village', 'District', 'State');
    expect(result.competitorSignal?.value.signal).toBe('Insufficient mapped evidence');
    expect(result.competitorSignal?.confidence).toBe('low');
  });

  it('normalizes market reach activity and channels', async () => {
    vi.mocked(osm.fetchOSMData).mockResolvedValue([
      { id: 1, type: 'retail', distanceKm: 3, osmTags: {} } as unknown as POIResult,
      { id: 2, type: 'food_service', distanceKm: 4, osmTags: {} } as unknown as POIResult,
      { id: 3, type: 'marketplace', distanceKm: 8, osmTags: {} } as unknown as POIResult,
      { id: 4, type: 'dairy_cooperative', distanceKm: 9, osmTags: {} } as unknown as POIResult
    ]);
    
    const result = await gatherLiveEvidence('Village', 'District', 'State');
    expect(result.marketReach?.value.zone5.count).toBe(2);
    expect(result.marketReach?.value.zone10.count).toBe(4);
    expect(result.marketReach?.value.zone5.signal).toBe('Low'); // 2 is Low
    expect(result.marketReach?.value.channels).toContain('Retail outlets');
    expect(result.marketReach?.value.channels).toContain('Food-service outlets');
    expect(result.marketReach?.value.channels).toContain('Local marketplaces');
    expect(result.marketReach?.value.channels).toContain('Collection/cooperative channel');
  });

  it('handles geocode failure gracefully', async () => {
    vi.mocked(geocoding.geocodeLocation).mockResolvedValue(null);
    const result = await gatherLiveEvidence('Unknown Village', 'Unknown District', 'State');
    expect(result.marketReach).toBeNull();
    expect(result.competitorSignal).toBeNull();
  });
});
