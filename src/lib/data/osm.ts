/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { POIResult } from "@/types/evidence";

const osmCache = new Map<string, POIResult[]>();
const QUERY_VERSION = "v1.1";

export async function fetchOSMData(lat: number, lon: number, radius: number): Promise<POIResult[] | null> {
  const roundedLat = lat.toFixed(3);
  const roundedLon = lon.toFixed(3);
  const cacheKey = `evidence:${roundedLat}:${roundedLon}:${radius}:${QUERY_VERSION}`;
  
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
  let endpointIndex = 0;
  
  for (const endpoint of endpoints) {
    endpointIndex++;
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[evidence] overpass ${radius}m request started (attempt ${endpointIndex}/${endpoints.length}): ${endpoint}`);
      }
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
        if (process.env.NODE_ENV === 'development') {
          console.log(`[evidence] overpass ${radius}m failed. endpoint=${endpoint} status=${response.status}`);
          if (endpointIndex < endpoints.length) {
            console.log(`[evidence] fallback attempted`);
          }
        }
        continue;
      }
      
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        if (endpointIndex > 1) {
          console.log(`[evidence] fallback success`);
        }
        console.log(`[evidence] overpass ${radius}m success. elements=${data.elements ? data.elements.length : 0}`);
      }
      
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
        
        // Stage B: Local Classification Rules
        const dairyTerms = ["dairy", "milk", "dudh", "doodh", "dugdha", "milk centre", "milk center"];
        const isDairyName = dairyTerms.some(term => nameLower.includes(term));
        const isCoopName = nameLower.includes("cooperative") || nameLower.includes("co-operative");
        
        // SUPPORT_INFRASTRUCTURE
        if (tags.amenity === "veterinary") {
          type = "veterinary";
        }
        // DIRECT_DAIRY_SIGNAL
        else if (tags.shop === "dairy" || isDairyName) {
          type = "dairy_business";
          if (isCoopName) type = "dairy_cooperative";
        }
        // POTENTIAL_SALES_CHANNEL
        else if (tags.amenity === "marketplace") {
          type = "marketplace";
        }
        else if (["supermarket", "convenience", "general", "grocery", "wholesale"].includes(tags.shop || "")) {
          type = "retail";
        }
        else if (["restaurant", "cafe", "fast_food"].includes(tags.amenity || "")) {
          type = "food_service";
        }
        
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
      if (process.env.NODE_ENV === 'development') {
        console.log(`[evidence] overpass ${radius}m error. endpoint=${endpoint} error=${error}`);
        if (endpointIndex < endpoints.length) {
          console.log(`[evidence] fallback attempted`);
        }
      }
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
