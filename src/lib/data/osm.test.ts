import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchOSMData } from './osm';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('OSM two-stage local classification and caching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockResponse = (elements: any[]) => ({
    ok: true,
    json: async () => ({ elements })
  });

  const mockErrorResponse = () => ({
    ok: false,
    status: 429,
    text: async () => 'Rate Limited'
  });

  it('classifies direct dairy signals based on structured tags and names', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([
      { id: 1, tags: { shop: 'dairy' }, lat: 10, lon: 20 },
      { id: 2, tags: { shop: 'convenience', name: 'Shree Dudh Center' }, lat: 10, lon: 20 },
      { id: 3, tags: { name: 'Amul Milk Parlour' }, lat: 10, lon: 20 },
      { id: 4, tags: { amenity: 'marketplace', name: 'village dairy cooperative' }, lat: 10, lon: 20 },
      { id: 5, tags: { shop: 'supermarket', name: 'Fresh Grocery' }, lat: 10, lon: 20 },
      { id: 6, tags: { amenity: 'veterinary' }, lat: 10, lon: 20 }
    ]));

    // Use a unique coordinate/radius so cache is fresh
    const results = await fetchOSMData(10.1, 20.1, 5000);
    
    expect(results).not.toBeNull();
    if (!results) return;

    expect(results.find(r => r.id === 1)?.type).toBe('dairy_business'); // shop=dairy
    expect(results.find(r => r.id === 2)?.type).toBe('dairy_business'); // "Dudh" in name (case-insensitive)
    expect(results.find(r => r.id === 3)?.type).toBe('dairy_business'); // "Milk" in name
    expect(results.find(r => r.id === 4)?.type).toBe('dairy_cooperative'); // "cooperative" in name
    expect(results.find(r => r.id === 5)?.type).toBe('retail'); // potential sales channel, NOT dairy
    expect(results.find(r => r.id === 6)?.type).toBe('veterinary'); // support infrastructure
  });

  it('caches successful real responses', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([{ id: 10, tags: { shop: 'dairy' }, lat: 10, lon: 20 }]));
    
    // First call
    await fetchOSMData(10.2, 20.2, 5000);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call with same parameters
    await fetchOSMData(10.2, 20.2, 5000);
    expect(mockFetch).toHaveBeenCalledTimes(1); // Should hit cache, not fetch again
  });

  it('does not cache provider failures', async () => {
    // Both fallback endpoints fail
    mockFetch
      .mockResolvedValueOnce(mockErrorResponse())
      .mockResolvedValueOnce(mockErrorResponse());

    const result = await fetchOSMData(10.3, 20.3, 5000);
    expect(result).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // If it was cached as null, this would not call fetch again, but it should!
    mockFetch.mockResolvedValueOnce(mockResponse([])); // Success on next try
    const nextResult = await fetchOSMData(10.3, 20.3, 5000);
    expect(nextResult).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(3); 
  });
  
  it('primary endpoint failure + fallback success returns AVAILABLE', async () => {
    // First fails, second succeeds
    mockFetch
      .mockResolvedValueOnce(mockErrorResponse())
      .mockResolvedValueOnce(mockResponse([{ id: 7, tags: { shop: 'dairy' }, lat: 10, lon: 20 }]));

    const result = await fetchOSMData(10.4, 20.4, 5000);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('successful empty response is not PROVIDER_UNAVAILABLE', async () => {
    // API returns empty elements array
    mockFetch.mockResolvedValueOnce(mockResponse([]));
    
    const result = await fetchOSMData(10.5, 20.5, 5000);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(0);
  });
});
