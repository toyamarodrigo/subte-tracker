import type { Route } from "@/types";

import { ALLOWED_LINES } from "@/constants";
import { routesSchema } from "@/schemas/gtfs-schema";

export const fetchRoutes = async (): Promise<Route[]> => {
  const response = await fetch("/data/routes.json");
  const data = await response.json();
  const validated = routesSchema.parse(data);

  return validated.filter(route => ALLOWED_LINES.includes(route.route_id));
};
