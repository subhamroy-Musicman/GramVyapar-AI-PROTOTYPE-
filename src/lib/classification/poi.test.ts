
import { describe, it, expect } from 'vitest';
import { classifyPOI } from './poi';
import { OsmCandidate } from '../data/osm';

describe('classifyPOI', () => {
  it('classifies shop=dairy as DIRECT_DAIRY_SIGNAL', () => {
    const candidate: OsmCandidate = { id: '1', type: 'node', name: null, latitude: 10, longitude: 20, tags: { shop: 'dairy' } };
    const res = classifyPOI(candidate);
    expect(res.category).toBe('DIRECT_DAIRY_SIGNAL');
    expect(res.classificationReason).toContain('shop=dairy');
  });

  it('classifies dairy/milk name match as DIRECT_DAIRY_SIGNAL', () => {
    const candidate: OsmCandidate = { id: '1', type: 'node', name: 'Pune Milk Centre', latitude: 10, longitude: 20, tags: {} };
    const res = classifyPOI(candidate);
    expect(res.category).toBe('DIRECT_DAIRY_SIGNAL');
    expect(res.matchedTerm).toBe('milk');
  });

  it('classifies supermarket as POTENTIAL_SALES_CHANNEL', () => {
    const candidate: OsmCandidate = { id: '1', type: 'node', name: null, latitude: 10, longitude: 20, tags: { shop: 'supermarket' } };
    const res = classifyPOI(candidate);
    expect(res.category).toBe('POTENTIAL_SALES_CHANNEL');
  });

  it('rejects Milkshake Cafe false positive', () => {
    const candidate: OsmCandidate = { id: '1', type: 'node', name: 'Milkshake Cafe', latitude: 10, longitude: 20, tags: { amenity: 'restaurant' } };
    const res = classifyPOI(candidate);
    expect(res.category).toBeNull();
  });

  it('rejects general milk store if shop is clothes', () => {
    const candidate: OsmCandidate = { id: '1', type: 'node', name: 'General Milk Store', latitude: 10, longitude: 20, tags: { shop: 'clothes' } };
    const res = classifyPOI(candidate);
    expect(res.category).toBeNull();
  });
});
