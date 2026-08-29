import { GeocodeResult } from "@/types/evidence";

const geocodeCache = new Map<string, GeocodeResult>();

export async function geocodeLocation(village: string, district: string, state: string): Promise<GeocodeResult | null> {
  const query = `${village}, ${district}, ${state}, India`;
  
  if (geocodeCache.has(query)) {
    return geocodeCache.get(query)!;
  }
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: {
        'User-Agent': 'GramVyapar-AI-Prototype/1.0 (internal hackathon prototype)',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data || data.length === 0) return null;
    
    const result: GeocodeResult = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      displayName: data[0].display_name,
      source: "OpenStreetMap",
      confidence: "medium"
    };
    
    geocodeCache.set(query, result);
    return result;
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}
