import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeather } from './openmeteo';

describe('fetchWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('returns valid data on success', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          temperature_2m_max: [35],
          temperature_2m_min: [25],
          precipitation_sum: [0]
        }
      })
    } as any);

    const result = await fetchWeather(10, 20);
    expect(result.providerAvailable).toBe(true);
    expect(result.maxTemp).toBe(35);
  });

  it('handles provider failure gracefully', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500
    } as any);

    const result = await fetchWeather(10, 20);
    expect(result.providerAvailable).toBe(false);
    expect(result.maxTemp).toBeNull();
  });
});
