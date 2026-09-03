export interface OsmCandidate {
  id: string;
  type: 'node' | 'way' | 'relation';
  name: string | null;
  latitude: number;
  longitude: number;
  tags: Record<string, string>;
}

export async function fetchOsmCandidates(lat: number, lon: number, radiusKm: number): Promise<OsmCandidate[] | null> {
  const radiusMeters = radiusKm * 1000;
  const query = `
    [out:json][timeout:25];
    (
      nwr["shop"~"^(dairy|supermarket|convenience|general|grocery)$"](around:${radiusMeters},${lat},${lon});
      nwr["amenity"~"^(marketplace|veterinary)$"](around:${radiusMeters},${lat},${lon});
    );
    out center;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'GramVyaparAI/0.1.0'
      }
    });

    if (!res.ok) {
      console.error('[OSM] Provider failure:', res.status);
      return null;
    }

    const data = await res.json();
    return normalizeOsm(data.elements || []);
  } catch (error) {
    console.error('[OSM] Network error:', error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOsm(elements: any[]): OsmCandidate[] {
  const candidates: OsmCandidate[] = [];
  
  for (const el of elements) {
    let lat: number | null = null;
    let lon: number | null = null;

    if (el.type === 'node') {
      lat = parseFloat(el.lat);
      lon = parseFloat(el.lon);
    } else if (el.type === 'way' || el.type === 'relation') {
      if (el.center) {
        lat = parseFloat(el.center.lat);
        lon = parseFloat(el.center.lon);
      }
    }

    if (lat !== null && lon !== null && Number.isFinite(lat) && Number.isFinite(lon)) {
      candidates.push({
        id: `${el.type}/${el.id}`,
        type: el.type,
        name: el.tags?.name || null,
        latitude: lat,
        longitude: lon,
        tags: el.tags || {}
      });
    }
  }

  return candidates;
}
