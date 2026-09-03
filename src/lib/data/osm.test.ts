import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchOsmCandidates } from './osm';

describe('fetchOsmCandidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('rejects objects without finite usable coordinates', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [
          { type: 'node', id: 1, lat: 'invalid', lon: 20, tags: { shop: 'dairy' } },
          { type: 'node', id: 2, lat: 10, lon: 20, tags: { shop: 'supermarket' } }
        ]
      })
    } as any);

    const candidates = await fetchOsmCandidates(10, 20, 5);
    expect(candidates).not.toBeNull();
    expect(candidates?.length).toBe(1);
    expect(candidates?.[0].id).toBe('node/2');
  });

  it('handles provider failure gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 429
    } as any);

    const candidates = await fetchOsmCandidates(10, 20, 5);
    expect(candidates).toBeNull();
  });
});
