export const queryKeys = {
  routes: ["routes"] as const,
  stops: ["stops"] as const,
  trips: ["trips"] as const,
  frequencies: ["frequencies"] as const,
  routeToStops: (routeId: string, direction: string) =>
    ["routeToStops", routeId, direction] as const,
  averageDurations: ["averageDurations"] as const,
  realtime: (routeId: string, stopId: string, direction: string) =>
    ["realtime", routeId, stopId, direction] as const,
  search: (query: string) => ["search", query] as const,
  directions: (routeId: string, stopId: string) =>
    ["directions", routeId, stopId] as const,
};
