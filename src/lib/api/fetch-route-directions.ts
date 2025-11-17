import type { RouteToStopsData, Trip } from "@/types";

import { tripsSchema } from "@/schemas/gtfs-schema";

export type RouteDirection = {
  directionId: string;
  directionDisplayName: string;
  terminalStopName: string;
};

export const fetchRouteDirections = async (routeId: string): Promise<RouteDirection[]> => {
  const [tripsResponse, routeToStopsResponse] = await Promise.all([
    fetch("/data/gtfs-trips.json"),
    fetch("/data/gtfs-route-to-stops.json"),
  ]);

  const tripsData = await tripsResponse.json();
  const routeToStopsData = await routeToStopsResponse.json();

  const trips = tripsSchema.parse(tripsData);
  const routeToStops = routeToStopsData as RouteToStopsData;

  const relevantTrips = trips.filter(trip => trip.route_id === routeId);
  const directionMap = new Map<string, { trip: Trip; terminalStopName: string }>();

  for (const trip of relevantTrips) {
    const directionId = trip.direction_id;

    if (!directionId)
      continue;

    const directionKey = `${routeId}_${directionId}`;
    const stops = routeToStops[directionKey] || [];

    if (stops.length > 0) {
      const terminalStop = stops[stops.length - 1];
      const existing = directionMap.get(directionId);

      if (!existing || trip.trip_headsign) {
        directionMap.set(directionId, {
          trip,
          terminalStopName: terminalStop.stopName,
        });
      }
    }
  }

  return Array.from(directionMap.entries()).map(([directionId, { trip, terminalStopName }]) => ({
    directionId,
    directionDisplayName: trip.trip_headsign || `Dirección ${directionId}`,
    terminalStopName,
  }));
};
