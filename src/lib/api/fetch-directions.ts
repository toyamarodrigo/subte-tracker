import type { DirectionOption, RouteToStopsData, Trip } from "@/types";

import { tripsSchema } from "@/schemas/gtfs-schema";

export const fetchDirections = async (
  routeId: string,
  stopId: string,
): Promise<DirectionOption[]> => {
  const [tripsResponse, routeToStopsResponse] = await Promise.all([
    fetch("/data/trips.json"),
    fetch("/data/route-to-stops.json"),
  ]);

  const tripsData = await tripsResponse.json();
  const routeToStopsData = await routeToStopsResponse.json();

  const trips = tripsSchema.parse(tripsData);
  const routeToStops = routeToStopsData as RouteToStopsData;

  const relevantTrips = trips.filter(trip => trip.route_id === routeId);
  const directionMap = new Map<number, { trip: Trip; stopName: string }>();

  for (const trip of relevantTrips) {
    const directionId = Number.parseInt(trip.direction_id, 10);

    if (Number.isNaN(directionId))
      continue;

    const directionKey = `${routeId}_${directionId}`;
    const stops = routeToStops[directionKey] || [];
    const stop = stops.find(s => s.stopId === stopId);

    if (stop) {
      const existing = directionMap.get(directionId);

      if (!existing || trip.trip_headsign) {
        directionMap.set(directionId, {
          trip,
          stopName: stop.stopName,
        });
      }
    }
  }

  return Array.from(directionMap.entries()).map(([rawDirectionId, { trip, stopName }]) => ({
    stopId,
    lineId: routeId,
    selectedStopName: stopName,
    directionDisplayName: trip.trip_headsign || `Dirección ${rawDirectionId}`,
    rawDirectionId,
  }));
};
