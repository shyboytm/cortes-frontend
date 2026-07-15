"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface NashvilleStatusProps {
  className?: string;
}

// Same coordinates as the "36.1627° N, 86.7816° W" line above this —
// Open-Meteo is free, keyless, and CORS-enabled, so this fetches straight
// from the browser rather than needing a server route/API key like the
// Last.fm widget does.
const LATITUDE = 36.1627;
const LONGITUDE = -86.7816;

// WMO weather codes (the scheme Open-Meteo's `weather_code` uses) collapsed
// down to short, human labels — only the buckets that are actually
// reachable from its `current` response are listed.
const WEATHER_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorms",
  96: "Thunderstorms",
  99: "Thunderstorms",
};

interface Weather {
  tempF: number;
  label: string;
}

export default function NashvilleStatus({ className }: NashvilleStatusProps) {
  const [time, setTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherFailed, setWeatherFailed] = useState(false);

  // Ticks the clock every second — cheap enough, and keeps the displayed
  // time from ever drifting visibly stale.
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Weather doesn't need second-by-second freshness — fetch on mount and
  // again every 10 minutes.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago`
        );
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        const tempF = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;
        if (!cancelled && typeof tempF === "number") {
          setWeather({ tempF: Math.round(tempF), label: WEATHER_LABELS[code] ?? "Conditions unknown" });
        }
      } catch (error) {
        console.error("Failed to fetch Nashville weather:", error);
        if (!cancelled) setWeatherFailed(true);
      }
    };

    load();
    const id = window.setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!time) return null;

  return (
    <p className={cn(className)}>
      {time} CT{weather && ` / ${weather.tempF}°F, ${weather.label}`}
      {weatherFailed && !weather && " — weather unavailable"}
    </p>
  );
}
