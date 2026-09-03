import { ResolvedLocation } from '../../domain/evidence/types';

export async function geocodeLocation(villageTown: string, district: string, state: string): Promise<ResolvedLocation | null> {
  const query = `${villageTown}, ${district}, ${state}, India`;
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.append('q', query);
  url.searchParams.append('format', 'jsonv2');
  url.searchParams.append('limit', '1');
  url.searchParams.append('countrycodes', 'in');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'GramVyaparAI/0.1.0'
      }
    });

    if (!res.ok) {
      console.error('[Geocoding] Provider failure:', res.status);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('[Geocoding] Location not found:', query);
      return null;
    }

    const first = data[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      console.error('[Geocoding] Invalid coordinates returned');
      return null;
    }

    return {
      originalInput: query,
      resolvedDisplayName: first.display_name,
      latitude: lat,
      longitude: lon,
      source: 'NOMINATIM'
    };
  } catch (error) {
    console.error('[Geocoding] Network or parsing error:', error);
    return null;
  }
}
