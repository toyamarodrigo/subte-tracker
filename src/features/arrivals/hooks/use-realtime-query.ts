import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchRealtime } from "@/lib/api/fetch-realtime";
import { queryKeys } from "@/lib/query/query-keys";

export const realtimeQueryOptions = (
  routeId: string,
  stopId: string,
  direction: string,
) => queryOptions({
  queryKey: queryKeys.realtime(routeId, stopId, direction),
  queryFn: () => fetchRealtime(routeId, stopId, direction),
  staleTime: 0,
  refetchInterval: 15000,
  refetchIntervalInBackground: false,
  enabled: !!routeId && !!stopId && !!direction,
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});

export const useRealtimeQuery = (
  routeId: string,
  stopId: string,
  direction: string,
) => {
  return useQuery(realtimeQueryOptions(routeId, stopId, direction));
};
