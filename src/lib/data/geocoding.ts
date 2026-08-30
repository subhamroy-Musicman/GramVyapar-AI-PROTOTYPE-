import { GeocodeResult } from "@/types/evidence";

const geocodeCache = new Map<string, GeocodeResult>();

export async function geocodeLocation(village: string, district: string, state: string): Promise<GeocodeResult | null> {
  const queries = [
    `${village}, ${district}, ${state}, India`.replace(/^,\s*/, ''),
    `${village}, ${district}, India`.replace(/^,\s*/, ''),
    `${district}, ${state}, India`.replace(/^,\s*/, '')
  ].filter(q => q && q !== ", India" && q.trim().length > 0);

  for (const query of queries) {
    if (geocodeCache.has(query)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[evidence] geocode cache hit: ${query}`);
      }
      return geocodeCache.get(query)!;
    }
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[evidence] geocode request started: ${query}`);
      }
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: {
          'User-Agent': 'GramVyapar-AI-Prototype/1.0 (internal hackathon prototype)',
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[evidence] geocode failed: ${response.status}`);
        }
        continue; // Try next fallback
      }
      
      const data = await response.json();
      if (!data || data.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[evidence] geocode no results for: ${query}`);
        }
        continue; // Try next fallback
      }
      
      const result: GeocodeResult = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
        source: "OpenStreetMap",
        confidence: query.includes(village) ? "high" : "low"
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[evidence] geocode success`);
        console.log(`lat=${result.latitude}`);
        console.log(`lon=${result.longitude}`);
      }
      
      geocodeCache.set(query, result);
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[evidence] geocode error:`, error);
      }
      // Continue to next fallback
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[evidence] geocode totally failed for all fallbacks`);
  }
  return null;
}
