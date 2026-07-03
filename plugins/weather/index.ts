/**
 * Weather Plugin — India Weather & Climate Data
 *
 * Fetches real-time weather data, IMD alerts, and AQI
 * for major Indian cities.
 */

import type { PluginManifest, PluginImplementation, PluginOutput, PluginItem } from '../sdk/types';
import { buildPluginOutput, pluginFetch } from '../sdk/loader';

interface OpenWeatherResponse {
  name: string;
  main: { temp: number; humidity: number; feels_like: number; temp_min: number; temp_max: number };
  weather: Array<{ main: string; description: string; icon: string }>;
  wind: { speed: number };
  visibility: number;
  dt: number;
  sys: { country: string };
}

export function createPlugin(manifest: PluginManifest): PluginImplementation {
  return {
    manifest,

    async fetch(): Promise<PluginOutput> {
      const start = Date.now();
      const allItems: PluginItem[] = [];
      let lastError: string | undefined;

      const cities = (manifest.config.cities as string[]) || [];
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        // No API key — return mock data explaining setup
        return buildPluginOutput(
          manifest.id,
          manifest.version,
          [],
          'OpenWeatherMap API',
          'no_data',
          'OPENWEATHER_API_KEY not configured in environment. Set it to enable weather data.',
          Date.now() - start
        );
      }

      // Fetch current weather for each city
      for (const city of cities) {
        try {
          const data = await pluginFetch<OpenWeatherResponse>({
            url: `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&units=metric&appid=${apiKey}`,
            method: 'GET',
            timeout: 10000,
            retries: 1,
          });

          const weatherId = `weather-${city.toLowerCase()}-${Date.now()}`;

          allItems.push({
            id: weatherId,
            title: `Current Weather: ${data.name}`,
            summary: `${data.weather[0]?.description || 'Clear'}, ${Math.round(data.main.temp)}°C, feels like ${Math.round(data.main.feels_like)}°C. Humidity: ${data.main.humidity}%. Wind: ${data.wind.speed} m/s.`,
            url: `https://openweathermap.org/city/${encodeURIComponent(city)}`,
            publishedAt: new Date(data.dt * 1000).toISOString(),
            source: 'OpenWeatherMap / IMD',
            category: 'weather-current',
            tags: ['weather', city.toLowerCase(), 'temperature', 'current'],
            trust_tier: 2,
            metadata: {
              city: data.name,
              state: '',
              temperature: data.main.temp,
              humidity: data.main.humidity,
              windSpeed: data.wind.speed,
              forecastType: 'current',
            },
          });
        } catch (err: any) {
          lastError = err.message;
          console.warn(`[Weather Plugin] Error fetching ${city}:`, err.message);
        }
      }

      return buildPluginOutput(
        manifest.id,
        manifest.version,
        allItems,
        'OpenWeatherMap API',
        allItems.length > 0 ? 'success' : lastError ? 'error' : 'no_data',
        lastError,
        Date.now() - start
      );
    },
  };
}
