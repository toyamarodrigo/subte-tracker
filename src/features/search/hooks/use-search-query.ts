import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchSearch } from "@/lib/api/fetch-search";
import { queryKeys } from "@/lib/query/query-keys";

export const searchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: queryKeys.search(query),
    queryFn: () => fetchSearch(query),
    enabled: query.trim().length > 0,
    staleTime: 30000,
  });

export const useSearchQuery = (query: string) => {
  return useQuery(searchQueryOptions(query));
};
