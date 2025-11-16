import type { Stop } from "@/types";

import { stopsSchema } from "@/schemas/gtfs-schema";

export const fetchStops = async (): Promise<Stop[]> => {
  const response = await fetch("/data/stops.json");
  const data = await response.json();

  return stopsSchema.parse(data);
};
