"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface NashvilleStatusProps {
  className?: string;
  initialWeather?: Weather;
}

export const LATITUDE = 36.1627;
export const LONGITUDE = -86.7816;

export const WEATHER_LABELS: Record<number, string> = {
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

export interface Weather {
  tempF: number;
  label: string;
}

export default function NashvilleStatus({ className, initialWeather }: NashvilleStatusProps) {
  const [time, setTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(initialWeather ?? null);
  const [weatherFailed, setWeatherFailed] = useState(false);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setTime(formatter.format(new Date()));

    let id: number | null = null;

    const start = () => {
      tick();
      id = window.setInterval(tick, 1000);
    };

    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
      Nashville, TN / {time} CT{weather && ` / ${weather.tempF}°F, ${weather.label}`}
      {weatherFailed && !weather && " — weather unavailable"}
    </p>
  );
}
