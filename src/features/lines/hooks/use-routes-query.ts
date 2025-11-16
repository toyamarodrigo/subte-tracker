import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchRoutes } from "@/lib/api/fetch-routes";
import { queryKeys } from "@/lib/query/query-keys";

export const routesQueryOptions = queryOptions({
  queryKey: queryKeys.routes,
  queryFn: fetchRoutes,
  staleTime: Infinity,
  gcTime: Infinity,
});

export const useRoutesQuery = () => {
  return useQuery(routesQueryOptions);
};
