export type StopOnLine = {
  stopId: string;
  stopName: string;
  sequence: number;
};

export type DirectionOption = {
  stopId: string;
  lineId: string;
  selectedStopName: string;
  directionDisplayName: string;
  rawDirectionId: number;
};

export type AverageDuration = {
  from_stop_id: string;
  to_stop_id: string;
  average_duration_seconds: number;
  sample_size: number;
};

export type LineAverageDurations = {
  [lineShortName: string]: AverageDuration[];
};

export type AverageDurationsData = {
  lineAverageDurations: LineAverageDurations;
};

export type RouteToStopsData = Record<string, StopOnLine[]>;
