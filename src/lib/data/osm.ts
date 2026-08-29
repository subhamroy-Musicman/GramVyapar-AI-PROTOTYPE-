import { POIResult } from "@/types/evidence";

const osmCache = new Map<string, POIResult[]>();

export async function fetchOSMData(lat: number, lon: number, radius: number): Promise<POIResult[] | null> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}-${radius}`;
  if (osmCache.has(cacheKey)) return osmCache.get(cacheKey)!;

  const query = `
    [out:json][timeout:25];
    (
      nwr["shop"="supermarket"](around:${radius}, ${lat}, ${lon});
      nwr["shop"="convenience"](around:${radius}, ${lat}, ${lon});
      nwr["shop"="dairy"](around:${radius}, ${lat}, ${lon});
      nwr["shop"="general"](around:${radius}, ${lat}, ${lon});
      nwr["shop"="grocery"](around:${radius}, ${lat}, ${lon});
      nwr["shop"="wholesale"](around:${radius}, ${lat}, ${lon});
      nwr["amenity"="marketplace"](around:${radius}, ${lat}, ${lon});
      nwr["amenity"="veterinary"](around:${radius}, ${lat}, ${lon});
      nwr["amenity"="cafe"](around:${radius}, ${lat}, ${lon});
      nwr["amenity"="restaurant"](around:${radius}, ${lat}, ${lon});
      nwr["amenity"="fast_food"](around:${radius}, ${lat}, ${lon});
    );
    out center;
  `;
  
  const endpoints = [
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass-api.de/api/interpreter"
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: "data=" + encodeURIComponent(query),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'GramVyaparAI/1.0 (Test)'
        },
        signal: AbortSignal.timeout(25000)
      });
      
      if (!response.ok) {
        lastError = `OSM Error ${response.status}: ${await response.text()}`;
        console.error(lastError);
        continue;
      }
      
      const data = await response.json();
      if (!data.elements) return []; // SUCCESS_EMPTY
      
      const results: POIResult[] = data.elements.map((el: any) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        const parsedLat = typeof elLat === 'number' ? elLat : 0;
        const parsedLon = typeof elLon === 'number' ? elLon : 0;
        
        const tags = el.tags || {};
        const distanceKm = getDistanceFromLatLonInKm(lat, lon, parsedLat, parsedLon);
        
        let type = "other";
        const nameLower = tags.name?.toLowerCase() || "";
        const isDairyName = nameLower.includes("dairy") || nameLower.includes("milk") || nameLower.includes("dudh") || nameLower.includes("doodh") || nameLower.includes("dugdha");
        const isCoopName = nameLower.includes("cooperative") || nameLower.includes("co-operative");
        
        if (tags.amenity === "veterinary") type = "veterinary";
        else if (tags.shop === "dairy" || isDairyName) type = "dairy_business";
        else if (isCoopName && (tags.shop || tags.amenity || isDairyName)) type = "dairy_cooperative";
        else if (tags.amenity === "marketplace") type = "marketplace";
        else if (["supermarket", "convenience", "general", "grocery", "wholesale"].includes(tags.shop || "")) type = "retail";
        else if (["restaurant", "cafe", "fast_food"].includes(tags.amenity || "")) type = "food_service";
        
        return {
          id: typeof el.id === 'number' ? el.id : 0,
          name: tags.name || "Unnamed",
          type,
          distanceKm,
          latitude: parsedLat,
          longitude: parsedLon,
          osmTags: tags
        };
      });
      
      // Deduplicate by id
      const uniqueResults = Array.from(new Map(results.map(r => [r.id, r])).values());
      
      osmCache.set(cacheKey, uniqueResults);
      return uniqueResults;
    } catch (error) {
      console.error(`OSM fetch failed for ${endpoint}:`, error);
      lastError = error;
    }
  }
  return null; // PROVIDER_ERROR
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2-lat1);  
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}
