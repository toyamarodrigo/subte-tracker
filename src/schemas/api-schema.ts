import { z } from "zod";

export const arrivalStatusSchema = z.enum(["on-time", "delayed", "early", "unknown"]);

export const arrivalInfoSchema = z.object({
  tripId: z.string(),
  routeId: z.string(),
  estimatedArrivalTime: z.number(),
  delaySeconds: z.number(),
  status: arrivalStatusSchema,
  departureTimeFromTerminal: z.string().optional(),
  vehicleId: z.string().optional(),
  isEstimate: z.boolean().optional(),
});

export const frequencyInfoSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  headwaySeconds: z.number(),
});

export const stopWithArrivalSchema = z.object({
  stopId: z.string(),
  stopName: z.string(),
  sequence: z.number(),
  nextArrival: z
    .object({
      estimatedArrivalTime: z.number(),
      delaySeconds: z.number(),
      status: arrivalStatusSchema,
    })
    .optional(),
});

export const realtimeResponseSchema = z.object({
  arrivals: z.array(arrivalInfoSchema),
  lineStopsWithArrivals: z.array(stopWithArrivalSchema),
  timestamp: z.number(),
  frequency: frequencyInfoSchema.optional(),
  shouldShowNoDataMessage: z.boolean().optional(),
});
