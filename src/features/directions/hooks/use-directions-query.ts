import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchDirections } from "@/lib/api/fetch-directions";
import { queryKeys } from "@/lib/query/query-keys";

export const directionsQueryOptions = (routeId: string, stopId: string) =>
  queryOptions({
    queryKey: queryKeys.directions(routeId, stopId),
    queryFn: () => fetchDirections(routeId, stopId),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!routeId && !!stopId,
  });

export const useDirectionsQuery = (routeId: string, stopId: string) => {
  return useQuery(directionsQueryOptions(routeId, stopId));
};
