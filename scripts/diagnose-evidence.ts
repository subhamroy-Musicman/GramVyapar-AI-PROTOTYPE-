import { buildEvidenceResult } from '../src/lib/data/evidence';
import { EvidenceItem } from '../src/domain/evidence/types';

async function main() {
  const args = process.argv.slice(2);
  const locationString = args[0];
  
  if (!locationString) {
    console.error('Usage: npm run diagnose:evidence -- "Village/Town, District, State"');
    process.exit(1);
  }

  const parts = locationString.split(',').map(s => s.trim());
  const villageTown = parts[0] || '';
  const district = parts[1] || '';
  const state = parts[2] || '';

  console.log('\nGRAMVYAPAR EVIDENCE DIAGNOSTIC\n');
  console.log('LOCATION');
  console.log('Input:', locationString);

  const result = await buildEvidenceResult(villageTown, district, state);

  if (!result.location) {
    console.log('Resolved: FAILED TO GEOCODE');
    console.log('Coordinates: N/A\n');
    console.log('EVIDENCE AVAILABILITY\n' + result.availability + '\n');
    process.exit(1);
  }

  console.log('Resolved:', result.location.resolvedDisplayName);
  console.log('Coordinates:', result.location.latitude + ', ' + result.location.longitude, '\n');

  function printRadius(radius: 5 | 10, rResult: typeof result.radius5km) {
    console.log(`WITHIN ${radius} KM`);
    if (!rResult) {
      console.log('Provider: UNAVAILABLE\n');
      return;
    }
    console.log('Provider:', rResult.providerAvailable ? 'AVAILABLE' : 'UNAVAILABLE');
    console.log('Raw mapped candidates:', rResult.rawCandidateCount);
    console.log('Direct dairy signals:', rResult.directDairySignals.length);
    console.log('Potential sales channels:', rResult.potentialSalesChannels.length);
    console.log('Support infrastructure:', rResult.supportInfrastructure.length, '\n');
  }

  printRadius(5, result.radius5km);
  printRadius(10, result.radius10km);

  function printItems(title: string, items: EvidenceItem[]) {
    console.log(`${title}`);
    if (items.length === 0) {
      console.log('None found.\n');
      return;
    }
    items.forEach(item => {
      console.log('Name:', item.name || 'Unnamed');
      console.log('Distance:', item.distanceKm.toFixed(2), 'km');
      console.log('Relevant tags:', JSON.stringify(item.relevantTags));
      console.log('Classification reason:', item.classificationReason);
      if (item.matchedTerm) {
        console.log('Matched term:', item.matchedTerm);
      }
      console.log('---');
    });
    console.log('');
  }

  const allDirect = [...(result.radius10km?.directDairySignals || [])];
  printItems('DIRECT DAIRY SIGNALS', allDirect);
  
  console.log('POTENTIAL SALES CHANNEL SUMMARY');
  console.log('Found', result.radius10km?.potentialSalesChannels.length || 0, 'within 10 km\n');

  console.log('SUPPORT INFRASTRUCTURE SUMMARY');
  console.log('Found', result.radius10km?.supportInfrastructure.length || 0, 'within 10 km\n');

  console.log('ENVIRONMENTAL CONTEXT');
  console.log('Provider:', result.environment.providerAvailable ? 'AVAILABLE' : 'UNAVAILABLE');
  console.log('Maximum temperature:', result.environment.maxTemp ?? 'N/A');
  console.log('Minimum temperature:', result.environment.minTemp ?? 'N/A');
  console.log('Precipitation:', result.environment.precipitation ?? 'N/A', '\n');

  console.log('EVIDENCE AVAILABILITY');
  console.log(result.availability, '\n');

  console.log('DAIRY-SPECIFIC CONFIDENCE');
  console.log(result.dairySpecificConfidence, '\n');

  console.log('COMMERCIAL EVIDENCE COVERAGE');
  console.log(result.commercialEvidenceCoverage, '\n');

  console.log('COMPETITIVE SIGNAL');
  console.log(result.competitiveSignal, '\n');

  console.log('SALES-CHANNEL SIGNAL');
  console.log(result.salesChannelSignal, '\n');

  console.log('CONFIDENCE REASON');
  console.log(result.confidenceReason, '\n');

  console.log('LIMITATIONS');
  result.limitations.forEach(lim => console.log(lim));
  console.log('');
}

main().catch(console.error);
