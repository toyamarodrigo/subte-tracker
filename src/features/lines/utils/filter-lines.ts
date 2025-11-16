import type { Route } from "@/types";

import { ALLOWED_LINES } from "@/constants";

export const filterAndSortLines = (routes: Route[]): Route[] => {
  const filtered = routes.filter(route => ALLOWED_LINES.includes(route.route_id));

  return filtered.sort((a, b) => {
    const order = ["A", "B", "E", "PM"];
    const aIndex = order.indexOf(a.route_short_name);
    const bIndex = order.indexOf(b.route_short_name);

    if (aIndex !== -1 && bIndex !== -1)
      return aIndex - bIndex;
    if (aIndex !== -1)
      return -1;
    if (bIndex !== -1)
      return 1;

    return a.route_short_name.localeCompare(b.route_short_name);
  });
};
