import type { StopOnLine } from "./domain";
import type { Route, Stop } from "./gtfs";

export type SearchResult = {
  stop: Stop;
  route: Route;
  direction: string;
  headsign: string;
};

export type ArrivalStatus = "on-time" | "delayed" | "early" | "unknown";

export type ArrivalInfo = {
  tripId: string;
  routeId: string;
  estimatedArrivalTime: number;
  delaySeconds: number;
  status: ArrivalStatus;
  departureTimeFromTerminal?: string;
  vehicleId?: string;
  isEstimate?: boolean;
};

export type StopWithArrival = {
  nextArrival?: {
    estimatedArrivalTime: number;
    delaySeconds: number;
    status: ArrivalStatus;
  };
} & StopOnLine;

export type FrequencyInfo = {
  startTime: string;
  endTime: string;
  headwaySeconds: number;
};

export type RealtimeResponse = {
  arrivals: ArrivalInfo[];
  lineStopsWithArrivals: StopWithArrival[];
  timestamp: number;
  frequency?: FrequencyInfo;
  shouldShowNoDataMessage?: boolean;
};
