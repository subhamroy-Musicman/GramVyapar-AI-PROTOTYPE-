import { EvidenceCategory } from '../../domain/evidence/types';
import { OsmCandidate } from '../data/osm';
import { EVIDENCE_CONFIG } from '../../config/evidence';

export interface POIClassification {
  category: EvidenceCategory | null;
  classificationReason: string;
  matchedTerm: string | null;
}

export function classifyPOI(candidate: OsmCandidate): POIClassification {
  const shop = candidate.tags.shop?.toLowerCase();
  const amenity = candidate.tags.amenity?.toLowerCase();
  const name = candidate.name?.toLowerCase() || '';

  // 1. Structured Tag Priority
  if (shop === 'dairy') {
    return {
      category: 'DIRECT_DAIRY_SIGNAL',
      classificationReason: 'OSM structured tag shop=dairy',
      matchedTerm: null
    };
  }

  if (amenity === 'veterinary') {
    return {
      category: 'SUPPORT_INFRASTRUCTURE',
      classificationReason: 'OSM structured tag amenity=veterinary',
      matchedTerm: null
    };
  }

  if (['supermarket', 'convenience', 'general', 'grocery'].includes(shop || '')) {
    return {
      category: 'POTENTIAL_SALES_CHANNEL',
      classificationReason: `OSM structured tag shop=${shop}`,
      matchedTerm: null
    };
  }

  if (amenity === 'marketplace') {
    return {
      category: 'POTENTIAL_SALES_CHANNEL',
      classificationReason: 'OSM structured tag amenity=marketplace',
      matchedTerm: null
    };
  }

  // 2. Local Name Matching
  // First, check for false positive categories before allowing name matching
  const nonDairyAmenities = ['restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'ice_cream', 'hospital', 'clinic'];
  
  if (nonDairyAmenities.includes(amenity || '')) {
    return {
      category: null,
      classificationReason: `Conflicting structured tag amenity=${amenity} overrides name matching`,
      matchedTerm: null
    };
  }
  
  if (shop && !['dairy', 'supermarket', 'convenience', 'general', 'grocery'].includes(shop)) {
    return {
      category: null,
      classificationReason: `Conflicting structured tag shop=${shop} overrides name matching`,
      matchedTerm: null
    };
  }

  for (const term of EVIDENCE_CONFIG.dairyTerms) {
    // strict boundary matching or at least avoiding "milkshake"
    if (name.includes(term)) {
      // Exclude "milkshake" if term is milk
      if (term === 'milk' && name.includes('milkshake')) {
        continue;
      }
      
      return {
        category: 'DIRECT_DAIRY_SIGNAL',
        classificationReason: `Dairy-related term '${term}' found in mapped business name`,
        matchedTerm: term
      };
    }
  }

  return {
    category: null,
    classificationReason: 'Unclassified mapped entity',
    matchedTerm: null
  };
}
