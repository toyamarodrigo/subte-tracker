import type { RouteToStopsData } from "@/types";

export const fetchRouteToStops = async (): Promise<RouteToStopsData> => {
  const response = await fetch("/data/gtfs-route-to-stops.json");
  const data = await response.json();

  return data as RouteToStopsData;
};
