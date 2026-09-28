import { describe, it, expect } from 'vitest';
import { calculateMarketReach } from './market-reach';
import { EvidenceResult, EvidenceItem } from './types';

function createMockItem(category: string, shop?: string, amenity?: string): EvidenceItem {
  return {
    source: 'OPENSTREETMAP',
    sourceId: Math.random().toString(),
    name: null,
    latitude: 0,
    longitude: 0,
    distanceKm: 0,
    category: category as any,
    classificationReason: '',
    matchedTerm: null,
    relevantTags: { shop, amenity } as any
  };
}

describe('Market Reach', () => {
  it('correctly summarizes 5km and 10km radii', () => {
    const mockEvidence: any = {
      availability: 'AVAILABLE',
      location: { resolutionLevel: 'LOCALITY' },
      radius5km: {
        providerAvailable: true,
        directDairySignals: [createMockItem('DIRECT_DAIRY_SIGNAL')],
        potentialSalesChannels: [createMockItem('POTENTIAL_SALES_CHANNEL', 'supermarket')],
        supportInfrastructure: []
      },
      radius10km: {
        providerAvailable: true,
        directDairySignals: [createMockItem('DIRECT_DAIRY_SIGNAL'), createMockItem('DIRECT_DAIRY_SIGNAL')],
        potentialSalesChannels: [createMockItem('POTENTIAL_SALES_CHANNEL', 'grocery'), createMockItem('POTENTIAL_SALES_CHANNEL', 'convenience')],
        supportInfrastructure: [createMockItem('SUPPORT_INFRASTRUCTURE')]
      }
    };
    
    const result = calculateMarketReach(mockEvidence);
    
    expect(result.radius5km.directBusinessSignals).toBe(1);
    expect(result.radius5km.potentialSalesChannels).toBe(1);
    expect(result.radius5km.totalMappedSignals).toBe(2);
    
    expect(result.radius10km.directBusinessSignals).toBe(2);
    expect(result.radius10km.potentialSalesChannels).toBe(2);
    expect(result.radius10km.supportInfrastructure).toBe(1);
    expect(result.radius10km.totalMappedSignals).toBe(5);
  });

  it('categorizes distribution channels correctly', () => {
    const mockEvidence: any = {
      availability: 'AVAILABLE',
      location: { resolutionLevel: 'LOCALITY' },
      radius5km: {
        providerAvailable: true,
        directDairySignals: [createMockItem('DIRECT_DAIRY_SIGNAL', 'dairy')],
        potentialSalesChannels: [createMockItem('POTENTIAL_SALES_CHANNEL', 'supermarket')],
        supportInfrastructure: []
      },
      radius10km: {
        providerAvailable: true,
        directDairySignals: [],
        potentialSalesChannels: [
          createMockItem('POTENTIAL_SALES_CHANNEL', 'grocery'),
          createMockItem('POTENTIAL_SALES_CHANNEL', '', 'marketplace')
        ],
        supportInfrastructure: []
      }
    };

    const result = calculateMarketReach(mockEvidence);
    
    const supermarkets = result.distributionChannels.find(c => c.id === 'supermarket');
    expect(supermarkets?.count5km).toBe(1);
    expect(supermarkets?.count10km).toBe(0);
    
    const grocery = result.distributionChannels.find(c => c.id === 'grocery');
    expect(grocery?.count5km).toBe(0);
    expect(grocery?.count10km).toBe(1);
    
    const markets = result.distributionChannels.find(c => c.id === 'marketplace');
    expect(markets?.count5km).toBe(0);
    expect(markets?.count10km).toBe(1);
  });

  it('honestly represents consumer base as DATA_UNAVAILABLE', () => {
    const result = calculateMarketReach({} as any);
    expect(result.consumerBase.status).toBe('DATA_UNAVAILABLE');
    expect(result.consumerBase.estimatedPopulation).toBeNull();
  });

  it('returns DATA_UNAVAILABLE if provider fails', () => {
    const result = calculateMarketReach({
      radius5km: { providerAvailable: false },
      radius10km: { providerAvailable: false }
    } as any);
    expect(result.status).toBe('DATA_UNAVAILABLE');
  });

  it('returns LIMITED if district fallback', () => {
    const result = calculateMarketReach({
      availability: 'AVAILABLE',
      radius5km: { providerAvailable: true },
      radius10km: { providerAvailable: true },
      location: { resolutionLevel: 'DISTRICT' }
    } as any);
    expect(result.status).toBe('LIMITED');
  });
});
