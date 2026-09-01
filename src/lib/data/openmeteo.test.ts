/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeather } from './openmeteo';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Open-Meteo Evidence Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockResponse = (data: any) => ({
    ok: true,
    json: async () => data
  });

  const mockErrorResponse = (status: number) => ({
    ok: false,
    status
  });

  it('parses successful weather response correctly', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({
      daily: {
        temperature_2m_max: [40.5],
        temperature_2m_min: [25.0],
        precipitation_sum: [25.5]
      }
    }));

    const result = await fetchWeather(10.1, 20.1);
    
    expect(result.status).toBe('AVAILABLE');
    if (result.status === 'AVAILABLE') {
      expect(result.daily.maxTemp).toBe(40.5);
      expect(result.isHeatStressRisk).toBe(true); // > 38
      expect(result.isLogisticsRisk).toBe(true); // > 20
    }
  });

  it('handles provider failure (e.g. 500 or 429)', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(429));
    
    const result = await fetchWeather(10.2, 20.2);
    expect(result.status).toBe('PROVIDER_UNAVAILABLE');
    if (result.status === 'PROVIDER_UNAVAILABLE') {
      expect(result.httpStatus).toBe(429);
    }
  });

  it('handles unexpected response shape', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({}));
    
    const result = await fetchWeather(10.3, 20.3);
    expect(result.status).toBe('PROVIDER_UNAVAILABLE');
  });

  it('caches successful responses', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({
      daily: {
        temperature_2m_max: [30.0],
        temperature_2m_min: [20.0],
        precipitation_sum: [0.0]
      }
    }));
    
    // Cache miss
    await fetchWeather(10.4, 20.4);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Cache hit
    await fetchWeather(10.4, 20.4);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
