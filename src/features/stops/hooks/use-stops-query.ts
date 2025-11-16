import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchStops } from "@/lib/api/fetch-stops";
import { queryKeys } from "@/lib/query/query-keys";

export const stopsQueryOptions = queryOptions({
  queryKey: queryKeys.stops,
  queryFn: fetchStops,
  staleTime: Infinity,
  gcTime: Infinity,
});

export const useStopsQuery = () => {
  return useQuery(stopsQueryOptions);
};
