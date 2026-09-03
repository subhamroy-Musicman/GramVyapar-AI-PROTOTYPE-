import { EnvironmentalContext } from '@/domain/evidence/types';

export async function fetchWeather(lat: number, lon: number): Promise<EnvironmentalContext> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=1`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[Open-Meteo] Provider failure:', res.status);
      return {
        source: 'OPEN_METEO',
        providerAvailable: false,
        maxTemp: null,
        minTemp: null,
        precipitation: null
      };
    }
    
    const data = await res.json();
    
    let maxTemp = null;
    let minTemp = null;
    let precipitation = null;
    
    if (data.daily) {
      if (data.daily.temperature_2m_max?.length > 0) maxTemp = data.daily.temperature_2m_max[0];
      if (data.daily.temperature_2m_min?.length > 0) minTemp = data.daily.temperature_2m_min[0];
      if (data.daily.precipitation_sum?.length > 0) precipitation = data.daily.precipitation_sum[0];
    }

    return {
      source: 'OPEN_METEO',
      providerAvailable: true,
      maxTemp,
      minTemp,
      precipitation
    };
  } catch (error) {
    console.error('[Open-Meteo] Network error:', error);
    return {
      source: 'OPEN_METEO',
      providerAvailable: false,
      maxTemp: null,
      minTemp: null,
      precipitation: null
    };
  }
}
