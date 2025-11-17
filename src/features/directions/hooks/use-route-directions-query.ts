import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchRouteDirections } from "@/lib/api/fetch-route-directions";

export const routeDirectionsQueryOptions = (routeId: string) =>
  queryOptions({
    queryKey: ["route-directions", routeId],
    queryFn: () => fetchRouteDirections(routeId),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!routeId,
  });

export const useRouteDirectionsQuery = (routeId: string) => {
  return useQuery(routeDirectionsQueryOptions(routeId));
};
