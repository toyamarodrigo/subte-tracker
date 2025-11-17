import type {
  ArrivalInfo,
  ArrivalStatus,
  AverageDurationsData,
  ExternalApiResponse,
  Frequency,
  RealtimeResponse,
  RouteToStopsData,
  StopWithArrival,
} from "@/types";

import { DWELL_TIME_SECONDS, LINES_WITH_VALID_REPORTS, MAX_ARRIVALS_TO_RETURN } from "@/constants";

import { getCurrentFrequency } from "./get-frequency";
import { getTotalTravelTime } from "./get-travel-time";

export const calculateArrivals = (
  externalData: ExternalApiResponse,
  routeId: string,
  stopId: string,
  direction: string,
  routeToStops: RouteToStopsData,
  averageDurations: AverageDurationsData,
  frequencies: Frequency[],
): RealtimeResponse => {
  const headerTime = externalData.Header.timestamp;
  const directionKey = `${routeId}_${direction}`;
  const currentStopSequence = routeToStops[directionKey] || [];

  if (currentStopSequence.length === 0) {
    return {
      arrivals: [],
      lineStopsWithArrivals: [],
      timestamp: headerTime * 1000,
      shouldShowNoDataMessage: !LINES_WITH_VALID_REPORTS.has(routeId),
    };
  }

  const lineShortName = routeId.replace(/^Linea/, "");
  const targetDirectionIdNum = Number.parseInt(direction, 10);
  const bestArrivalPerStopId = new Map<string, {
    estimatedArrivalTime: number;
    delaySeconds: number;
    status: ArrivalStatus;
  }>();

  externalData.Entity.forEach((entity) => {
    const tripInfo = entity.Linea;
    let tripDirectionIdNum: number | null = null;

    if (tripInfo.Direction_ID !== undefined && tripInfo.Direction_ID !== null) {
      const parsedNum = Number.parseInt(String(tripInfo.Direction_ID), 10);

      if (!Number.isNaN(parsedNum))
        tripDirectionIdNum = parsedNum;
    }

    if (tripInfo.Route_Id === routeId && tripDirectionIdNum === targetDirectionIdNum) {
      tripInfo.Estaciones.forEach((station) => {
        if (station.arrival?.time) {
          const arrivalTime = station.arrival.time;
          const delay = station.arrival.delay ?? 0;

          let isValidReport: boolean;

          if (LINES_WITH_VALID_REPORTS.has(tripInfo.Route_Id)) {
            isValidReport = true;
          }
          else {
            isValidReport = delay > 0 || arrivalTime !== headerTime;
          }

          if (isValidReport) {
            const estimatedArrivalTime = headerTime + delay;

            if (estimatedArrivalTime >= headerTime) {
              let status: ArrivalStatus = "unknown";

              if (delay === 0)
                status = "on-time";
              else if (delay < 0 && delay >= -180)
                status = "early";
              else if (delay < -180 || delay > 180)
                status = "delayed";

              const currentArrival = { estimatedArrivalTime, delaySeconds: delay, status };
              const existing = bestArrivalPerStopId.get(station.stop_id);

              if (!existing || currentArrival.estimatedArrivalTime < existing.estimatedArrivalTime) {
                bestArrivalPerStopId.set(station.stop_id, currentArrival);
              }
            }
          }
        }
      });
    }
  });

  const finalArrivals: ArrivalInfo[] = [];
  const targetStopIndex = currentStopSequence.findIndex(s => s.stopId === stopId);

  if (targetStopIndex === -1) {
    return {
      arrivals: [],
      lineStopsWithArrivals: [],
      timestamp: headerTime * 1000,
      shouldShowNoDataMessage: !LINES_WITH_VALID_REPORTS.has(routeId),
    };
  }

  const arrivalAtTarget = bestArrivalPerStopId.get(stopId);
  let lastRelevantArrivalTime = -Infinity;
  let tripIdForFrequency = "";

  if (arrivalAtTarget && arrivalAtTarget.estimatedArrivalTime > headerTime) {
    const sourceEntity = externalData.Entity.find(
      e => e.Linea.Route_Id === routeId
        && Number.parseInt(String(e.Linea.Direction_ID), 10) === targetDirectionIdNum
        && e.Linea.Estaciones.some(s => s.stop_id === stopId),
    );

    if (sourceEntity?.Linea.Trip_Id) {
      tripIdForFrequency = sourceEntity.Linea.Trip_Id;
    }

    finalArrivals.push({
      ...arrivalAtTarget,
      tripId: sourceEntity?.ID || `REAL_${stopId}_${arrivalAtTarget.estimatedArrivalTime}`,
      routeId,
      departureTimeFromTerminal: sourceEntity?.Linea.start_time,
      vehicleId: sourceEntity?.ID,
      isEstimate: false,
    });

    lastRelevantArrivalTime = arrivalAtTarget.estimatedArrivalTime;
  }

  let lastSeenArrival = arrivalAtTarget ? arrivalAtTarget.estimatedArrivalTime : Infinity;
  const durationsForLine = averageDurations.lineAverageDurations[lineShortName];

  if (durationsForLine) {
    for (let N = 1; N <= targetStopIndex && finalArrivals.length < MAX_ARRIVALS_TO_RETURN; N++) {
      const currentIndex = targetStopIndex - N;
      const currentStop = currentStopSequence[currentIndex];
      const arrivalAtCurrentStop = bestArrivalPerStopId.get(currentStop.stopId);

      if (!arrivalAtCurrentStop || arrivalAtCurrentStop.estimatedArrivalTime <= headerTime) {
        lastSeenArrival = Infinity;
        continue;
      }

      if (arrivalAtCurrentStop.estimatedArrivalTime > lastSeenArrival) {
        const travelTime = getTotalTravelTime(
          currentStop.stopId,
          stopId,
          currentStopSequence,
          durationsForLine,
        );

        if (travelTime !== null) {
          const dwellTime = N * DWELL_TIME_SECONDS;
          const projectedArrival = arrivalAtCurrentStop.estimatedArrivalTime + travelTime + dwellTime;

          if (projectedArrival > headerTime && projectedArrival > lastRelevantArrivalTime) {
            finalArrivals.push({
              status: arrivalAtCurrentStop.status,
              delaySeconds: arrivalAtCurrentStop.delaySeconds,
              tripId: `ESTIMATE_${N}_FROM_${currentStop.stopId}`,
              routeId,
              estimatedArrivalTime: projectedArrival,
              isEstimate: true,
            });

            lastRelevantArrivalTime = projectedArrival;
          }
        }
      }

      lastSeenArrival = arrivalAtCurrentStop.estimatedArrivalTime;
    }
  }

  finalArrivals.sort((a, b) => a.estimatedArrivalTime - b.estimatedArrivalTime);
  const limitedArrivals = finalArrivals.slice(0, MAX_ARRIVALS_TO_RETURN);

  const lineStopsWithArrivals: StopWithArrival[] = currentStopSequence
    .map(stop => ({
      stopId: stop.stopId,
      stopName: stop.stopName,
      sequence: stop.sequence,
      nextArrival: bestArrivalPerStopId.get(stop.stopId),
    }))
    .filter((stop) => {
      const arrival = stop.nextArrival;

      return !arrival || arrival.estimatedArrivalTime >= headerTime;
    });

  let frequency;

  if (tripIdForFrequency) {
    const currentFreq = getCurrentFrequency(tripIdForFrequency, frequencies);

    if (currentFreq) {
      frequency = {
        startTime: currentFreq.start_time,
        endTime: currentFreq.end_time,
        headwaySeconds: currentFreq.headway_secs,
      };
    }
  }

  return {
    arrivals: limitedArrivals,
    lineStopsWithArrivals,
    timestamp: headerTime * 1000,
    frequency,
    shouldShowNoDataMessage: !LINES_WITH_VALID_REPORTS.has(routeId),
  };
};
