import { WeatherResult } from "@/types/evidence";

const weatherCache = new Map<string, WeatherResult>();

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResult | null> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (weatherCache.has(cacheKey)) return weatherCache.get(cacheKey)!;

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code&daily=temperature_2m_max&timezone=auto`, {
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.current) return null;
    
    const currentTemp = data.current.temperature_2m;
    const maxTemp = data.daily?.temperature_2m_max?.[0] || currentTemp;
    const precipitation = data.current.precipitation;
    const weatherCode = data.current.weather_code;
    
    const isHeatStressRisk = maxTemp > 38;
    const isLogisticsRisk = precipitation > 10 || [95, 96, 99].includes(weatherCode);
    
    const result: WeatherResult = {
      currentTemp,
      maxTemp,
      precipitation,
      conditions: decodeWeatherCode(weatherCode),
      isHeatStressRisk,
      isLogisticsRisk
    };
    
    weatherCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}

function decodeWeatherCode(code: number): string {
  if (code <= 3) return "Clear/Cloudy";
  if (code <= 49) return "Fog/Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}
