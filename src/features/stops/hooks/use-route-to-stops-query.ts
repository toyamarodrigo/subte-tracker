import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchRouteToStops } from "@/lib/api/fetch-route-to-stops";

export const routeToStopsQueryOptions = queryOptions({
  queryKey: ["routeToStops"] as const,
  queryFn: fetchRouteToStops,
  staleTime: Infinity,
  gcTime: Infinity,
});

export const useRouteToStopsQuery = () => {
  return useQuery(routeToStopsQueryOptions);
};
