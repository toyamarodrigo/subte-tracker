import { z } from "zod";

export const stopSchema = z.object({
  stop_id: z.string(),
  stop_name: z.string(),
  stop_lat: z.string().optional(),
  stop_lon: z.string().optional(),
  location_type: z.string().optional(),
  parent_station: z.string().optional(),
  wheelchair_boarding: z.string().optional(),
});

export const routeSchema = z.object({
  route_id: z.string(),
  agency_id: z.string().optional(),
  route_short_name: z.string(),
  route_long_name: z.string(),
  route_type: z.string().optional(),
  route_color: z.string().optional(),
  route_text_color: z.string().optional(),
});

export const tripSchema = z.object({
  route_id: z.string(),
  service_id: z.string(),
  trip_id: z.string(),
  trip_headsign: z.string().optional(),
  direction_id: z.string(),
  shape_id: z.string().optional(),
});

export const frequencySchema = z.object({
  trip_id: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  headway_secs: z.number(),
  exact_times: z.number(),
});

export const stopsSchema = z.array(stopSchema);
export const routesSchema = z.array(routeSchema);
export const tripsSchema = z.array(tripSchema);
export const frequenciesSchema = z.array(frequencySchema);
