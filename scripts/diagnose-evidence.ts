import { geocodeLocation } from '../src/lib/data/geocoding';
import { fetchOSMData } from '../src/lib/data/osm';
import { gatherLiveEvidence } from '../src/lib/data/evidence';
import { POIResult } from '../src/types/evidence';

async function diagnoseEvidence(locationString: string) {
  // Parse location string (expecting "Village, District, State")
  const parts = locationString.split(',').map(s => s.trim());
  const village = parts[0] || "";
  const district = parts[1] || "";
  const state = parts[2] || "";

  console.log(`\n==================================================`);
  console.log(`EVIDENCE DIAGNOSTIC: ${locationString}`);
  console.log(`==================================================`);
  
  const geo = await geocodeLocation(village, district, state);
  
  console.log(`\nLOCATION`);
  console.log(`- Input location: ${locationString}`);
  
  if (!geo) {
    console.log(`- Geocoding status: LOCATION_UNRESOLVED`);
    return;
  }
  
  console.log(`- Resolved display name: ${geo.displayName}`);
  console.log(`- Latitude: ${geo.latitude}`);
  console.log(`- Longitude: ${geo.longitude}`);
  console.log(`- Geocoding status: SUCCESS`);
  
  const allDairySignals: POIResult[] = [];
  
  for (const radius of [5000, 10000]) {
    console.log(`\n${radius / 1000} KM`);
    const results = await fetchOSMData(geo.latitude, geo.longitude, radius);
    
    if (results === null) {
      console.log(`- Raw candidate POIs: PROVIDER_UNAVAILABLE`);
      continue;
    }
    
    const marketReachTypes = ["marketplace", "retail", "food_service", "dairy_business", "dairy_cooperative"];
    
    const rawCount = results.length;
    const marketPOIs = results.filter(p => marketReachTypes.includes(p.type)).length;
    const dairySignals = results.filter(p => ["dairy_business", "dairy_cooperative"].includes(p.type));
    const salesChannels = results.filter(p => ["retail", "food_service", "marketplace"].includes(p.type)).length;
    const vetPOIs = results.filter(p => p.type === "veterinary").length;
    
    console.log(`- Raw candidate POIs: ${rawCount}`);
    console.log(`- Mapped market/activity POIs: ${marketPOIs}`);
    console.log(`- Direct dairy signals: ${dairySignals.length}`);
    console.log(`- Potential sales channels: ${salesChannels}`);
    console.log(`- Veterinary/support POIs: ${vetPOIs}`);
    
    if (radius === 10000) {
      allDairySignals.push(...dairySignals);
    }
  }

  // Deduplicate for listing
  const uniqueDairySignals = Array.from(new Map(allDairySignals.map(p => [p.id, p])).values());

  console.log(`\nDIRECT DAIRY EVIDENCE`);
  if (uniqueDairySignals.length === 0) {
    console.log(`No direct dairy evidence found.`);
  } else {
    for (const poi of uniqueDairySignals) {
      console.log(`- Name: ${poi.name}`);
      console.log(`  Distance: ${poi.distanceKm.toFixed(2)} km`);
      console.log(`  Relevant OSM tags: ${JSON.stringify(poi.osmTags)}`);
      
      const isStructured = poi.osmTags.shop === 'dairy';
      let reason = isStructured ? 'STRUCTURED_DAIRY_TAG' : 'LOCAL_DAIRY_NAME_MATCH';
      console.log(`  Classification reason: ${reason}`);
      
      if (!isStructured) {
        const dairyTerms = ["dairy", "milk", "dudh", "doodh", "dugdha", "milk centre", "milk center"];
        const matchedTerm = dairyTerms.find(term => poi.name.toLowerCase().includes(term));
        if (matchedTerm) {
          console.log(`  Matched dairy term: "${matchedTerm}"`);
        }
      }
      console.log();
    }
  }

  console.log(`\nWEATHER`);
  const weatherResult = await import('../src/lib/data/openmeteo').then(m => m.fetchWeather(geo.latitude, geo.longitude));
  if (weatherResult.status === "AVAILABLE") {
    console.log(`- Provider status: SUCCESS`);
    console.log(`- Available forecast fields: Max Temp (${weatherResult.daily.maxTemp}°C), Min Temp (${weatherResult.daily.minTemp}°C), Precipitation (${weatherResult.daily.precipitationSum}mm)`);
  } else {
    console.log(`- Provider status: PROVIDER_UNAVAILABLE`);
  }

  console.log(`\nEVIDENCE CONFIDENCE`);
  const evidenceAgg = await gatherLiveEvidence(village, district, state);
  if (evidenceAgg.competitorSignal) {
    const conf = evidenceAgg.competitorSignal.confidence.toUpperCase();
    console.log(`- ${conf}`);
    console.log(`Explanation: ${evidenceAgg.competitorSignal.value.guidance}`);
  } else {
    console.log(`- PROVIDER_UNAVAILABLE`);
  }
}

const arg = process.argv.slice(2).join(' ');
if (!arg) {
  console.log("Please provide a location. Example: npm run diagnose:evidence -- \"Nashik, Maharashtra\"");
  process.exit(1);
}

diagnoseEvidence(arg);
