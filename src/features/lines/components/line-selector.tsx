import { useSuspenseQuery } from "@tanstack/react-query";

import { routesQueryOptions } from "../hooks/use-routes-query";
import { filterAndSortLines } from "../utils/filter-lines";
import { LineCard } from "./line-card";

export const LineSelector = () => {
  const { data: routes } = useSuspenseQuery(routesQueryOptions);
  const sortedRoutes = filterAndSortLines(routes);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedRoutes.map(route => (
        <LineCard key={route.route_id} route={route} />
      ))}
    </div>
  );
};
