import type { AverageDuration, StopOnLine } from "@/types";

export const getTotalTravelTime = (
  startStopId: string,
  endStopId: string,
  stopSequence: StopOnLine[],
  averageDurations: AverageDuration[],
): number | null => {
  const startIndex = stopSequence.findIndex(s => s.stopId === startStopId);
  const endIndex = stopSequence.findIndex(s => s.stopId === endStopId);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return null;
  }

  let totalDuration = 0;

  for (let i = startIndex; i < endIndex; i++) {
    const current = stopSequence[i];
    const next = stopSequence[i + 1];

    const segment = averageDurations.find(
      d => d.from_stop_id === current.stopId && d.to_stop_id === next.stopId,
    );

    if (!segment)
      return null;

    totalDuration += segment.average_duration_seconds;
  }

  return totalDuration;
};
