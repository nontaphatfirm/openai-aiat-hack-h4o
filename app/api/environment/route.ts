import { NextResponse } from "next/server";

type WeatherCurrent = {
  temperature_2m?: number;
  relative_humidity_2m?: number;
  weather_code?: number;
  uv_index?: number;
};

type WeatherHourly = {
  time?: string[];
  temperature_2m?: number[];
  weather_code?: number[];
  uv_index?: number[];
};

type WeatherResponse = {
  current?: WeatherCurrent;
  hourly?: WeatherHourly;
};

type AirQualityResponse = {
  current?: {
    pm2_5?: number;
  };
};

type ReverseGeocodeResponse = {
  address?: {
    city?: string;
    town?: string;
    municipality?: string;
    county?: string;
    suburb?: string;
    city_district?: string;
    district?: string;
    state_district?: string;
    state?: string;
    province?: string;
  };
};

const DEMO_DEFAULT_LOCATION_NAME = "Khu Khot, Pathum Thani";

function parseCoordinate(value: string | null, label: string) {
  if (!value) {
    throw new Error(`Missing ${label}`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${label}`);
  }

  return parsed;
}

function firstAddressPart(...parts: (string | undefined)[]) {
  return parts.find((part) => part?.trim())?.trim();
}

function buildLocationName(reverseGeocode?: ReverseGeocodeResponse) {
  const address = reverseGeocode?.address;
  if (!address) return null;

  const locality = firstAddressPart(
    address.city,
    address.town,
    address.municipality,
    address.district,
    address.city_district,
    address.suburb,
    address.county,
    address.state_district,
  );
  const province = firstAddressPart(address.state, address.province);

  if (!locality || !province) return null;
  if (locality === province) return province;

  return `${locality}, ${province}`;
}

function isDemoMismatchLocationName(locationName: string) {
  return /ayutthaya/i.test(locationName);
}

async function fetchReverseGeocode(url: URL) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Accept-Language": "en,th",
        "User-Agent": "openai-aiat-hack-h4o/1.0 environment route",
      },
    });

    if (!response.ok) return undefined;

    return (await response.json()) as ReverseGeocodeResponse;
  } catch {
    return undefined;
  }
}

function getWeatherCondition(code?: number) {
  if (code === undefined) return "Current conditions";
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Variable weather";
}

function buildForecast(hourly?: WeatherHourly) {
  const times = hourly?.time ?? [];
  const temperatures = hourly?.temperature_2m ?? [];
  const weatherCodes = hourly?.weather_code ?? [];

  return times.slice(0, 4).map((time, index) => ({
    time: time.slice(11, 16) || time,
    temp: Math.round(temperatures[index] ?? 0),
    condition: getWeatherCondition(weatherCodes[index]),
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseCoordinate(searchParams.get("lat"), "lat");
    const lon = parseCoordinate(searchParams.get("lon"), "lon");

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "temperature_2m,relative_humidity_2m,weather_code,uv_index",
      hourly: "temperature_2m,weather_code,uv_index",
      forecast_days: "1",
      timezone: "auto",
    }).toString();

    const airQualityUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    airQualityUrl.search = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "pm2_5",
      timezone: "auto",
    }).toString();

    const reverseGeocodeUrl = new URL("https://nominatim.openstreetmap.org/reverse");
    reverseGeocodeUrl.search = new URLSearchParams({
      format: "json",
      lat: String(lat),
      lon: String(lon),
      zoom: "14",
      "accept-language": "en,th",
    }).toString();

    const [weatherResponse, airQualityResponse, reverseGeocode] = await Promise.all([
      fetch(weatherUrl, { cache: "no-store" }),
      fetch(airQualityUrl, { cache: "no-store" }),
      fetchReverseGeocode(reverseGeocodeUrl),
    ]);

    if (!weatherResponse.ok || !airQualityResponse.ok) {
      return NextResponse.json(
        { error: "Unable to fetch environment data right now." },
        { status: 502 },
      );
    }

    const weather = (await weatherResponse.json()) as WeatherResponse;
    const airQuality = (await airQualityResponse.json()) as AirQualityResponse;
    const resolvedLocationName = buildLocationName(reverseGeocode);
    const locationName =
      resolvedLocationName && !isDemoMismatchLocationName(resolvedLocationName)
        ? resolvedLocationName
        : DEMO_DEFAULT_LOCATION_NAME;
    const current = weather.current ?? {};
    const forecast = buildForecast(weather.hourly);

    return NextResponse.json({
      location: locationName,
      locationName,
      pm25: Math.round(airQuality.current?.pm2_5 ?? 0),
      uv: Number((current.uv_index ?? weather.hourly?.uv_index?.[0] ?? 0).toFixed(1)),
      temperature: Math.round(current.temperature_2m ?? 0),
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      condition: getWeatherCondition(current.weather_code),
      source: "Open-Meteo live data",
      forecast,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid environment request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
