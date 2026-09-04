import { ResolvedLocation, GeocodeResult, LocationResolutionLevel } from '../../domain/evidence/types';
import { normalizeLocation } from '../geo/normalize-location';

async function fetchNominatim(query: string): Promise<any[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.append('q', query);
  url.searchParams.append('format', 'jsonv2');
  url.searchParams.append('limit', '5');
  url.searchParams.append('countrycodes', 'in');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'GramVyaparAI/0.1.0'
    }
  });

  if (!res.ok) {
    throw new Error('PROVIDER_FAILURE');
  }

  return res.json();
}

function parseCandidate(data: any, originalInput: string, resolutionLevel: LocationResolutionLevel): ResolvedLocation | null {
  const lat = parseFloat(data.lat);
  const lon = parseFloat(data.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return {
    originalInput,
    resolvedDisplayName: data.display_name,
    latitude: lat,
    longitude: lon,
    source: 'NOMINATIM',
    resolutionLevel
  };
}

export async function geocodeLocation(villageTown: string, district: string, state: string): Promise<GeocodeResult> {
  const { normalized } = normalizeLocation(villageTown, district, state);
  
  const loc = normalized.locality;
  const dist = normalized.district;
  const st = normalized.state;
  
  try {
    // Strategy 1: LOCALITY + DISTRICT + STATE
    if (loc && dist && st) {
      const q1 = `${loc}, ${dist}, ${st}, India`;
      const res1 = await fetchNominatim(q1);
      if (res1.length > 0) {
        const candidate = parseCandidate(res1[0], q1, 'LOCALITY');
        if (candidate) return { status: 'SUCCESS', location: candidate };
      }
    }

    // Strategy 2: LOCALITY + STATE
    if (loc && st) {
      const q2 = `${loc}, ${st}, India`;
      const res2 = await fetchNominatim(q2);
      if (res2.length > 0) {
        const candidate = parseCandidate(res2[0], q2, 'LOCALITY');
        if (candidate) return { status: 'SUCCESS', location: candidate };
      }
    }

    // Strategy 3: DISTRICT + STATE
    if (dist && st) {
      const q3 = `${dist}, ${st}, India`;
      const res3 = await fetchNominatim(q3);
      if (res3.length > 0) {
        const candidate = parseCandidate(res3[0], q3, 'DISTRICT');
        if (candidate) return { status: 'SUCCESS', location: candidate };
      }
    }

    // Strategy 4: STATE only (NOT USED FOR EVIDENCE, JUST FALLBACK FOR WEATHER/DEBUG)
    if (st) {
      const q4 = `${st}, India`;
      const res4 = await fetchNominatim(q4);
      if (res4.length > 0) {
        const candidate = parseCandidate(res4[0], q4, 'STATE');
        if (candidate) return { status: 'SUCCESS', location: candidate };
      }
    }

    return { status: 'NOT_FOUND' };
  } catch (error: any) {
    if (error.message === 'PROVIDER_FAILURE') {
      return { status: 'PROVIDER_FAILURE' };
    }
    console.error('[Geocoding] Network or parsing error:', error);
    return { status: 'PROVIDER_FAILURE' };
  }
}
