export type WeatherEvidenceResult =
  | {
      status: "AVAILABLE";
      daily: {
        maxTemp: number;
        minTemp: number;
        precipitationSum: number;
      };
      isHeatStressRisk: boolean;
      isLogisticsRisk: boolean;
    }
  | {
      status: "PROVIDER_UNAVAILABLE";
      provider: "OPEN_METEO";
      httpStatus?: number;
      message?: string;
    };

const weatherCache = new Map<string, WeatherEvidenceResult>();
const CACHE_VERSION = "v1";

export async function fetchWeather(lat: number, lon: number): Promise<WeatherEvidenceResult> {
  const roundedLat = lat.toFixed(3);
  const roundedLon = lon.toFixed(3);
  const cacheKey = `openmeteo:${roundedLat}:${roundedLon}:${CACHE_VERSION}`;
  
  if (weatherCache.has(cacheKey)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[evidence] openmeteo cache hit: ${cacheKey}`);
    }
    return weatherCache.get(cacheKey)!;
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[evidence] openmeteo request started`);
    }
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`,
      {
        signal: AbortSignal.timeout(10000)
      }
    );
    
    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[evidence] openmeteo failed status=${response.status}`);
      }
      return {
        status: "PROVIDER_UNAVAILABLE",
        provider: "OPEN_METEO",
        httpStatus: response.status
      };
    }
    
    const data = await response.json();
    if (!data.daily) {
      return {
        status: "PROVIDER_UNAVAILABLE",
        provider: "OPEN_METEO",
        message: "No daily data found"
      };
    }
    
    const maxTemp = data.daily.temperature_2m_max[0] ?? 30;
    const minTemp = data.daily.temperature_2m_min[0] ?? 20;
    const precipitationSum = data.daily.precipitation_sum[0] ?? 0;
    
    const isHeatStressRisk = maxTemp > 38;
    const isLogisticsRisk = precipitationSum > 20;
    
    const result: WeatherEvidenceResult = {
      status: "AVAILABLE",
      daily: {
        maxTemp,
        minTemp,
        precipitationSum
      },
      isHeatStressRisk,
      isLogisticsRisk
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[evidence] openmeteo success. maxTemp=${maxTemp}`);
    }
    
    weatherCache.set(cacheKey, result);
    return result;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[evidence] openmeteo error:`, error);
    }
    return {
      status: "PROVIDER_UNAVAILABLE",
      provider: "OPEN_METEO",
      message: error.message
    };
  }
}
