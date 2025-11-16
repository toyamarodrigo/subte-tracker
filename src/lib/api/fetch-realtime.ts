import type { RealtimeResponse } from "@/types";

import { calculateArrivals } from "@/features/arrivals/utils/calculate-arrivals";

export const fetchRealtime = async (
  routeId: string,
  stopId: string,
  direction: string,
): Promise<RealtimeResponse> => {
  const CLIENT_ID = import.meta.env.VITE_SUBTE_API_CLIENT_ID;
  const CLIENT_SECRET = import.meta.env.VITE_SUBTE_API_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("API credentials not configured");
  }

  const externalResponse = await fetch(
    `https://apitransporte.buenosaires.gob.ar/subtes/forecastGTFS?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    },
  );

  if (!externalResponse.ok) {
    throw new Error(`External API error: ${externalResponse.status}`);
  }

  const externalData = await externalResponse.json();

  const [routeToStops, averageDurations, frequencies] = await Promise.all([
    fetch("/data/gtfs-route-to-stops.json").then(r => r.json()),
    fetch("/data/gtfs-tiempo-promedio-entre-estaciones.json").then(r => r.json()),
    fetch("/data/gtfs-frequencies.json").then(r => r.json()),
  ]);

  return calculateArrivals(
    externalData,
    routeId,
    stopId,
    direction,
    routeToStops,
    averageDurations,
    frequencies,
  );
};
