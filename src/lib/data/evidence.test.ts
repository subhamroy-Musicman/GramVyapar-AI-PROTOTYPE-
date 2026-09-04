import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildEvidenceResult } from './evidence';
import * as osm from './osm';
import * as geocoding from './geocoding';
import * as openmeteo from './openmeteo';
import { ResolvedLocation } from '@/domain/evidence/types';

vi.mock('./osm');
vi.mock('./geocoding');
vi.mock('./openmeteo');

describe('evidence orchestrator', () => {
  const mockLocation: ResolvedLocation = {
    originalInput: 'Test',
    resolvedDisplayName: 'Test, District, State',
    resolutionLevel: 'LOCALITY',
    latitude: 10,
    longitude: 20,
    source: 'NOMINATIM'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(geocoding.geocodeLocation).mockResolvedValue({ status: 'SUCCESS', location: { ...mockLocation, resolutionLevel: 'LOCALITY' } as any });
    vi.mocked(openmeteo.fetchWeather).mockResolvedValue({
      source: 'OPEN_METEO',
      providerAvailable: true,
      maxTemp: 35,
      minTemp: 25,
      precipitation: 0
    });
  });

  it('handles geocode failure safely', async () => {
    vi.mocked(geocoding.geocodeLocation).mockResolvedValue({ status: 'NOT_FOUND' });
    const result = await buildEvidenceResult('Unknown', 'Unknown', 'State');
    expect(result.availability).toBe('PROVIDER_UNAVAILABLE');
    expect(result.dairySpecificConfidence).toBe('INSUFFICIENT');
  });

  it('preserves 5km evidence if 10km fails', async () => {
    vi.mocked(osm.fetchOsmCandidates).mockImplementation(async (lat, lon, r) => {
      if (r === 5) return [{ id: 'node/1', type: 'node', name: null, latitude: 10.01, longitude: 20.01, tags: { shop: 'dairy' } }];
      return null;
    });

    const result = await buildEvidenceResult('Village', 'District', 'State');
    expect(result.radius5km?.providerAvailable).toBe(true);
    expect(result.radius10km?.providerAvailable).toBe(false);
    expect(result.availability).toBe('AVAILABLE');
  });

  it('preserves 10km evidence if 5km fails', async () => {
    vi.mocked(osm.fetchOsmCandidates).mockImplementation(async (lat, lon, r) => {
      if (r === 10) return [{ id: 'node/1', type: 'node', name: null, latitude: 10.01, longitude: 20.01, tags: { shop: 'dairy' } }];
      return null;
    });

    const result = await buildEvidenceResult('Village', 'District', 'State');
    expect(result.radius5km?.providerAvailable).toBe(false);
    expect(result.radius10km?.providerAvailable).toBe(true);
    expect(result.availability).toBe('AVAILABLE');
    expect(result.confidenceReason).toContain('10 km mapped evidence is available, but the 5 km provider request failed');
  });

  it('preserves OSM evidence if Open-Meteo fails', async () => {
    vi.mocked(osm.fetchOsmCandidates).mockResolvedValue([]);
    vi.mocked(openmeteo.fetchWeather).mockResolvedValue({
      source: 'OPEN_METEO',
      providerAvailable: false,
      maxTemp: null,
      minTemp: null,
      precipitation: null
    });

    const result = await buildEvidenceResult('Village', 'District', 'State');
    expect(result.environment.providerAvailable).toBe(false);
    expect(result.availability).toBe('INSUFFICIENT'); // empty OSM is insufficient, not unavailable
  });
  
  it('assigns HIGH dairy confidence correctly and dedups duplicate items', async () => {
    vi.mocked(osm.fetchOsmCandidates).mockResolvedValue([
      { id: '1', type: 'node', name: 'Dairy 1', latitude: 10.01, longitude: 20.01, tags: { shop: 'dairy' } },
      { id: '2', type: 'node', name: 'Dairy 2', latitude: 10.01, longitude: 20.01, tags: { shop: 'dairy' } },
      { id: '3', type: 'node', name: 'Dairy 3', latitude: 10.01, longitude: 20.01, tags: { shop: 'dairy' } },
      // Duplicate ID
      { id: '3', type: 'node', name: 'Dairy 3', latitude: 10.01, longitude: 20.01, tags: { shop: 'dairy' } },
      // Node/Way representation duplicate (same name, close coords)
      { id: '4', type: 'way', name: 'Dairy 2', latitude: 10.01001, longitude: 20.01001, tags: { shop: 'dairy' } }
    ]);
    const result = await buildEvidenceResult('V', 'D', 'S');
    expect(result.dairySpecificConfidence).toBe('HIGH');
    expect(result.radius10km?.directDairySignals.length).toBe(3); // Deduplicated from 5 down to 3
    expect(result.competitiveSignal).toBe('OBSERVED');
  });

  it('handles 0 dairy + many commercial', async () => {
    vi.mocked(osm.fetchOsmCandidates).mockResolvedValue([
      { id: '1', type: 'node', name: null, latitude: 10.01, longitude: 20.01, tags: { shop: 'supermarket' } },
      { id: '2', type: 'node', name: null, latitude: 10.01, longitude: 20.01, tags: { shop: 'supermarket' } }
    ]);
    const result = await buildEvidenceResult('V', 'D', 'S');
    expect(result.dairySpecificConfidence).toBe('INSUFFICIENT');
    expect(result.commercialEvidenceCoverage).toBe('LOW');
    expect(result.competitiveSignal).toBe('INSUFFICIENT');
    expect(result.salesChannelSignal).toBe('LIMITED');
  });
});
