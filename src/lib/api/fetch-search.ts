import type { SearchResult } from "@/types";

import { routesSchema, stopsSchema } from "@/schemas/gtfs-schema";

export const fetchSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim())
    return [];

  const [routesResponse, stopsResponse, tripsResponse, routeToStopsResponse] = await Promise.all([
    fetch("/data/gtfs-routes.json"),
    fetch("/data/gtfs-stops.json"),
    fetch("/data/gtfs-trips.json"),
    fetch("/data/gtfs-route-to-stops.json"),
  ]);

  const routesData = await routesResponse.json();
  const stopsData = await stopsResponse.json();
  const tripsData = await tripsResponse.json();
  const routeToStopsData = await routeToStopsResponse.json();

  const routes = routesSchema.parse(routesData);
  const stops = stopsSchema.parse(stopsData);
  const trips = tripsData;
  const routeToStops = routeToStopsData as Record<string, Array<{ stopId: string; stopName: string; sequence: number }>>;

  const queryLower = query.toLowerCase();
  const matchingStops = stops.filter(stop =>
    stop.stop_name.toLowerCase().includes(queryLower),
  );

  const results: SearchResult[] = [];

  for (const stop of matchingStops) {
    for (const route of routes) {
      for (const directionId of ["0", "1"]) {
        const directionKey = `${route.route_id}_${directionId}`;
        const stopsInDirection = routeToStops[directionKey] || [];

        if (stopsInDirection.some(s => s.stopId === stop.stop_id)) {
          const trip = trips.find(
            (t: { route_id: string; direction_id: string }) =>
              t.route_id === route.route_id && t.direction_id === directionId,
          );

          if (trip) {
            results.push({
              stop,
              route,
              direction: directionId,
              headsign: trip.trip_headsign || `Dirección ${directionId}`,
            });
          }
        }
      }
    }
  }

  return results;
};
