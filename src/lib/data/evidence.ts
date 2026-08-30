import { LiveEvidence, EvidenceItem } from "@/types/evidence";
import { geocodeLocation } from "./geocoding";
import { fetchOSMData } from "./osm";
import { fetchWeather } from "./openmeteo";

export async function gatherLiveEvidence(village: string, district: string, state: string): Promise<LiveEvidence> {
  console.log(`\n[LocalEvidence] Resolving location: ${village}, ${district}, ${state}`);
  const geocode = await geocodeLocation(village, district, state);
  
  if (!geocode) {
    console.log(`[LocalEvidence] Geocoding failed`);
    return {
      geocode: null,
      marketReach: null,
      competitorSignal: null,
      veterinaryAccess: null,
      weatherRisk: null
    };
  }
  console.log(`[LocalEvidence] Coordinates: ${geocode.latitude}, ${geocode.longitude}`);
  
  const [osm5Result, osm10Result, weatherData] = await Promise.all([
    fetchOSMData(geocode.latitude, geocode.longitude, 5000).catch(e => { console.log('[LocalEvidence] 5km request failed:', e); return null; }),
    fetchOSMData(geocode.latitude, geocode.longitude, 10000).catch(e => { console.log('[LocalEvidence] 10km request failed:', e); return null; }),
    fetchWeather(geocode.latitude, geocode.longitude).catch((e) => ({
      status: "PROVIDER_UNAVAILABLE",
      provider: "OPEN_METEO",
      message: e.message
    } as const))
  ]);
  
  console.log(`[LocalEvidence] 5km raw element count: ${osm5Result ? osm5Result.length : 'FAILED'}`);
  console.log(`[LocalEvidence] 10km raw element count: ${osm10Result ? osm10Result.length : 'FAILED'}`);
  
  // Create a merged array for UI backwards-compatibility, keeping track of availability
  const is5Available = osm5Result !== null;
  const is10Available = osm10Result !== null;
  
  const osm5 = osm5Result || [];
  const osm10 = osm10Result || [];
  
  // Deduplicate merged array in case 10km returned elements already in 5km
  const mergedMap = new Map();
  osm5.forEach(p => mergedMap.set(p.id, p));
  osm10.forEach(p => mergedMap.set(p.id, p));
  const osmData = is5Available || is10Available ? Array.from(mergedMap.values()) : null;
  
  const now = new Date().toISOString();
  
  const COMPETITOR_THRESHOLDS = { LOW: 1, MODERATE: 4, HIGH: 9 };
  const MARKET_THRESHOLDS = { LOW: 1, MODERATE: 11, STRONG: 31 };
  
  // 1. Competitor Signal (Mapped Dairy-Business Signal)
  let competitorSignal: EvidenceItem | null = null;
  if (osmData !== null) {
    const dairyPOIs = osmData.filter(p => ["dairy_business", "dairy_cooperative"].includes(p.type));
    const count5 = dairyPOIs.filter(p => p.distanceKm <= 5).length;
    const count10 = dairyPOIs.filter(p => p.distanceKm <= 10).length;
    
    let compSignal = "Insufficient mapped evidence";
    let guidance = "Available mapped data is insufficient to estimate competitive intensity reliably.";
    if (count10 >= COMPETITOR_THRESHOLDS.HIGH) {
      compSignal = "High mapped signal";
      guidance = "A comparatively high number of mapped dairy-related businesses is visible in the search area. This can indicate both established demand and stronger competitive pressure.";
    } else if (count10 >= COMPETITOR_THRESHOLDS.MODERATE) {
      compSignal = "Moderate mapped signal";
      guidance = "Several relevant dairy businesses are visible in mapped data, suggesting an established local dairy market with meaningful competition.";
    } else if (count10 >= COMPETITOR_THRESHOLDS.LOW) {
      compSignal = "Low mapped signal";
      guidance = "Few relevant dairy-business POIs were identified in available mapped data. This may indicate lower visible competition, but incomplete mapping prevents a definitive conclusion.";
    }
    
    const structuredCount = dairyPOIs.filter(p => p.osmTags.shop === "dairy").length;
    const nameBasedCount = count10 - structuredCount;
    
    let confidence: "low" | "medium" | "high" = "low";
    if (count10 === 0) {
      confidence = "low"; // Or maybe this is fine as "low" along with "Insufficient" signal
    } else if (structuredCount > 1) {
      confidence = "high";
    } else if (structuredCount === 1 || nameBasedCount > 1) {
      confidence = "medium";
    } else {
      confidence = "low"; // only sparse/name-based evidence
    }
    
    competitorSignal = {
      id: "competitor-osm",
      category: "Competitor Mapping",
      label: "Mapped Dairy-Business Signal",
      value: { zone5: count5, zone10: count10, signal: compSignal, guidance, samples: dairyPOIs.slice(0, 3) },
      source: "OpenStreetMap",
      sourceType: "live-api",
      confidence,
      geographyLevel: "radius",
      retrievedAt: now,
      caveat: "This reflects businesses identifiable in currently mapped OpenStreetMap data, not the complete real-world competitor count."
    };
  }
  
  // 2. Market Reach (Mapped Market Activity Signal)
  let marketReach: EvidenceItem | null = null;
  if (osmData !== null) {
    const marketPOIs = osmData.filter(p => ["marketplace", "retail", "food_service", "dairy_business", "dairy_cooperative"].includes(p.type));
    const getMarketSignal = (count: number) => {
      if (count >= MARKET_THRESHOLDS.STRONG) return "Strong";
      if (count >= MARKET_THRESHOLDS.MODERATE) return "Moderate";
      if (count >= MARKET_THRESHOLDS.LOW) return "Low";
      return "Insufficient";
    };
    
    const count5 = marketPOIs.filter(p => p.distanceKm <= 5).length;
    const count10 = marketPOIs.filter(p => p.distanceKm <= 10).length;
    
    const channels = new Set(marketPOIs.map(p => p.type));
    const likelyChannels = [];
    if (channels.has("retail")) likelyChannels.push("Retail outlets");
    if (channels.has("food_service")) likelyChannels.push("Food-service outlets");
    if (channels.has("marketplace")) likelyChannels.push("Local marketplaces");
    if (channels.has("dairy_business")) likelyChannels.push("Dairy/milk retail");
    if (channels.has("dairy_cooperative")) likelyChannels.push("Collection/cooperative channel");
    
    let confidence: "low" | "medium" | "high" = count10 > 0 ? "medium" : "low";
    if (count10 > 10) confidence = "high";
    
    marketReach = {
      id: "market-reach-osm",
      category: "Market Reach",
      label: "Mapped Market Activity Signal",
      value: {
        zone5: { count: count5, signal: getMarketSignal(count5) },
        zone10: { count: count10, signal: getMarketSignal(count10) },
        channels: likelyChannels.length > 0 ? likelyChannels : [],
        samples: marketPOIs.slice(0, 3)
      },
      source: "OpenStreetMap",
      sourceType: "live-api",
      confidence,
      geographyLevel: "radius",
      retrievedAt: now,
      caveat: "Mapped activity is used as a local market proxy in this prototype. Mapped coverage may be incomplete."
    };
  }
  
  // 3. Veterinary Access
  let veterinaryAccess: EvidenceItem | null = null;
  if (osmData !== null) {
    const vets = osmData.filter(p => p.type === "veterinary");
    let vetSignal = "No relevant mapped POIs found in this search.";
    let nearestVetDist = -1;
    let nearestVetName = "";
    if (vets.length > 0) {
      const nearest = vets.sort((a, b) => a.distanceKm - b.distanceKm)[0];
      nearestVetDist = nearest.distanceKm;
      nearestVetName = nearest.name;
      if (nearestVetDist < 5) vetSignal = "Good mapped access";
      else if (nearestVetDist <= 10) vetSignal = "Moderate mapped access";
      else vetSignal = "Limited mapped access";
    }
    
    veterinaryAccess = {
      id: "vet-osm",
      category: "Veterinary Access",
      label: vetSignal,
      value: nearestVetDist > -1 ? { distance: nearestVetDist, name: nearestVetName } : null,
      source: "OpenStreetMap",
      sourceType: "live-api",
      confidence: "medium",
      geographyLevel: "radius",
      retrievedAt: now,
      caveat: "OpenStreetMap coverage may be incomplete."
    };
  }
  
  // 4. Weather Risk
  let weatherRisk: EvidenceItem | null = null;
  if (weatherData && weatherData.status === "AVAILABLE") {
    const risks = [];
    if (weatherData.isHeatStressRisk) risks.push("Potential heat-stress indicator");
    if (weatherData.isLogisticsRisk) risks.push("Possible logistics/feed-supply disruption indicator");
    
    weatherRisk = {
      id: "weather-om",
      category: "Weather Risk",
      label: risks.length > 0 ? risks.join(" | ") : "No immediate environmental risks detected",
      value: weatherData.daily,
      source: "Open-Meteo",
      sourceType: "live-api",
      confidence: "high",
      geographyLevel: "point",
      retrievedAt: now,
      caveat: "Prototype environmental risk signals. Not a long-term climate certainty."
    };
  }
  
  return {
    geocode,
    marketReach,
    competitorSignal,
    veterinaryAccess,
    weatherRisk
  };
}
