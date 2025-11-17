import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Types (inlined to avoid import issues)
type ExternalApiArrivalDepartureInfo = { time?: number; delay?: number };
type ExternalApiStation = { stop_id: string; stop_name: string; arrival?: ExternalApiArrivalDepartureInfo; departure?: ExternalApiArrivalDepartureInfo };
type ExternalApiTripLinea = { Trip_Id: string; Route_Id: string; Direction_ID: number | string; start_time: string; start_date: string; Estaciones: ExternalApiStation[] };
type ExternalApiEntity = { ID: string; Linea: ExternalApiTripLinea };
type ExternalApiResponse = { Header: { timestamp: number }; Entity: ExternalApiEntity[] };

type StopOnLine = { stopId: string; stopName: string; sequence: number };
type RouteToStopsData = Record<string, StopOnLine[]>;
type AverageDuration = { from_stop_id: string; to_stop_id: string; average_duration_seconds: number; sample_size: number };
type LineAverageDurations = { [lineShortName: string]: AverageDuration[] };
type AverageDurationsData = { lineAverageDurations: LineAverageDurations };
type Frequency = { trip_id: string; start_time: string; end_time: string; headway_secs: number; exact_times: number };
type ArrivalStatus = "on-time" | "delayed" | "early" | "unknown";
type ArrivalInfo = { tripId: string; routeId: string; estimatedArrivalTime: number; delaySeconds: number; status: ArrivalStatus; departureTimeFromTerminal?: string; vehicleId?: string; isEstimate?: boolean };
type StopWithArrival = { stopId: string; stopName: string; sequence: number; nextArrival?: { estimatedArrivalTime: number; delaySeconds: number; status: ArrivalStatus } };
type FrequencyInfo = { startTime: string; endTime: string; headwaySeconds: number };
type RealtimeResponse = { arrivals: ArrivalInfo[]; lineStopsWithArrivals: StopWithArrival[]; timestamp: number; frequency?: FrequencyInfo; shouldShowNoDataMessage?: boolean };

// Constants
const DWELL_TIME_SECONDS = 24;
const MAX_ARRIVALS_TO_RETURN = 4;
const LINES_WITH_VALID_REPORTS = new Set(["LineaA", "LineaB", "LineaE"]);

// Utility functions (inlined)
function getCurrentFrequency(tripId: string, frequencies: Frequency[]): Frequency | null {
  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return frequencies.find((f) => {
    if (f.trip_id !== tripId) return false;
    const startParts = f.start_time.split(":").map(Number);
    const endParts = f.end_time.split(":").map(Number);
    const startSeconds = startParts[0] * 3600 + startParts[1] * 60 + (startParts[2] || 0);
    const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + (endParts[2] || 0);
    return currentSeconds >= startSeconds && currentSeconds <= endSeconds;
  }) || null;
}

function getTotalTravelTime(startStopId: string, endStopId: string, stopSequence: StopOnLine[], averageDurations: AverageDuration[]): number | null {
  const startIndex = stopSequence.findIndex(s => s.stopId === startStopId);
  const endIndex = stopSequence.findIndex(s => s.stopId === endStopId);
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return null;
  let totalDuration = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const current = stopSequence[i];
    const next = stopSequence[i + 1];
    const segment = averageDurations.find(d => d.from_stop_id === current.stopId && d.to_stop_id === next.stopId);
    if (!segment) return null;
    totalDuration += segment.average_duration_seconds;
  }
  return totalDuration;
}

async function loadLocalJsonData<T>(filePath: string, baseUrl?: string): Promise<T | null> {
  // Try filesystem first (for local dev)
  try {
    const fullPath = join(process.cwd(), "public", filePath);
    
    if (existsSync(fullPath)) {
      const fileData = readFileSync(fullPath, "utf8");
      return JSON.parse(fileData) as T;
    }
  } catch (error) {
    console.warn(`[API /api/realtime] Filesystem read failed for ${filePath}, trying HTTP fetch`);
  }

  // Fallback to HTTP fetch (for Vercel production)
  try {
    const url = baseUrl 
      ? `${baseUrl}/${filePath}`
      : `https://${process.env.VERCEL_URL || "subte-tracker.vercel.app"}/${filePath}`;
    
    console.log(`[API /api/realtime] Fetching ${filePath} from ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[API /api/realtime] HTTP fetch failed for ${filePath}: ${response.status}`);
      return null;
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`[API /api/realtime] Error loading ${filePath}:`, error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { routeId, stopId, direction } = req.query;

    if (!routeId || !stopId || !direction) {
      return res.status(400).json({ error: "routeId, stopId, and direction are required" });
    }

    const CLIENT_ID = process.env.SUBTE_API_CLIENT_ID;
    const CLIENT_SECRET = process.env.SUBTE_API_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("[API /api/realtime] Error: API credentials not configured");
      return res.status(500).json({ error: "Server configuration error (realtime)" });
    }

    const shouldShowNoDataMessage = !LINES_WITH_VALID_REPORTS.has(String(routeId));

    // Fetch external API
    console.log("[API /api/realtime] Fetching external API");
    const externalResponse = await fetch(
      `https://apitransporte.buenosaires.gob.ar/subtes/forecastGTFS?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
    );

    if (!externalResponse.ok) {
      const errorBody = await externalResponse.text();
      console.error(
        `[API /api/realtime] External API error: ${externalResponse.status} ${externalResponse.statusText}. Body: ${errorBody.substring(0, 500)}`,
      );
      return res.status(502).json({
        error: `Error ${externalResponse.status} contacting subway service.`,
      });
    }

    const externalData: ExternalApiResponse = await externalResponse.json();

    if (!externalData?.Header || !externalData?.Entity) {
      console.error("[API /api/realtime] Error: Invalid external API response");
      return res.status(502).json({ error: "Invalid response from subway service" });
    }

    // Load local data
    const baseUrl = req.headers.host 
      ? `https://${req.headers.host}`
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : undefined;

    const [routeToStopsDefinition, averageDurationsData, frequenciesData] = await Promise.all([
      loadLocalJsonData<RouteToStopsData>("data/gtfs-route-to-stops.json", baseUrl),
      loadLocalJsonData<AverageDurationsData>("data/gtfs-tiempo-promedio-entre-estaciones.json", baseUrl),
      loadLocalJsonData<Frequency[]>("data/gtfs-frequencies.json", baseUrl),
    ]);

    if (!routeToStopsDefinition || !averageDurationsData) {
      console.error(
        "[API /api/realtime] Error: Could not load route_to_stops or average durations data",
      );
      return res.status(500).json({ error: "Internal server error loading route data" });
    }

    // Process data
    const headerTime = externalData.Header.timestamp;
    const routeIdStr = String(routeId);
    const stopIdStr = String(stopId);
    const directionStr = String(direction);
    const directionKey = `${routeIdStr}_${directionStr}`;
    const currentStopSequence = routeToStopsDefinition[directionKey] || [];

    if (currentStopSequence.length === 0) {
      console.warn(`No stop sequence found for ${routeIdStr} direction ${directionStr}`);
      return res.json({
        arrivals: [],
        lineStopsWithArrivals: [],
        timestamp: headerTime * 1000,
        shouldShowNoDataMessage,
      });
    }

    const lineShortName = routeIdStr.replace(/^Linea/, "");
    const targetDirectionIdNum = Number.parseInt(directionStr, 10);
    const bestArrivalPerStopId = new Map<
      string,
      {
        estimatedArrivalTime: number;
        delaySeconds: number;
        status: "on-time" | "delayed" | "early" | "unknown";
      }
    >();

    // Populate bestArrivalPerStopId
    externalData.Entity.forEach((entity) => {
      const tripInfo = entity.Linea;
      let tripDirectionIdNum: number | null = null;

      if (tripInfo.Direction_ID !== undefined && tripInfo.Direction_ID !== null) {
        const parsedNum = Number.parseInt(String(tripInfo.Direction_ID), 10);
        if (!Number.isNaN(parsedNum)) tripDirectionIdNum = parsedNum;
      }

      if (tripInfo.Route_Id === routeIdStr && tripDirectionIdNum === targetDirectionIdNum) {
        tripInfo.Estaciones.forEach((station) => {
          if (station.arrival?.time) {
            const arrivalTimeAtStation = station.arrival.time;
            const delayAtStation = station.arrival.delay ?? 0;

            let isValidReport: boolean;
            if (LINES_WITH_VALID_REPORTS.has(tripInfo.Route_Id)) {
              isValidReport = true;
            }
            else {
              isValidReport = delayAtStation > 0 || arrivalTimeAtStation !== headerTime;
            }

            if (isValidReport) {
              const estimatedArrivalTimeForStation = headerTime + delayAtStation;
              if (estimatedArrivalTimeForStation >= headerTime - 60) {
                let arrivalStatusForStation: "on-time" | "delayed" | "early" | "unknown" = "unknown";
                if (delayAtStation === 0) arrivalStatusForStation = "on-time";
                else if (delayAtStation < 0 && delayAtStation >= -180) arrivalStatusForStation = "early";
                else if (delayAtStation < -180 || delayAtStation > 180) arrivalStatusForStation = "delayed";

                const currentArrivalInfo = {
                  estimatedArrivalTime: estimatedArrivalTimeForStation,
                  delaySeconds: delayAtStation,
                  status: arrivalStatusForStation,
                };
                const existingBest = bestArrivalPerStopId.get(station.stop_id);
                if (
                  !existingBest
                  || currentArrivalInfo.estimatedArrivalTime < existingBest.estimatedArrivalTime
                ) {
                  bestArrivalPerStopId.set(station.stop_id, currentArrivalInfo);
                }
              }
            }
          }
        });
      }
    });

    // Build arrivals list for target stop
    const finalArrivals: Array<{
      tripId: string;
      routeId: string;
      estimatedArrivalTime: number;
      delaySeconds: number;
      status: "on-time" | "delayed" | "early" | "unknown";
      departureTimeFromTerminal?: string;
      vehicleId?: string;
      isEstimate?: boolean;
    }> = [];
    const targetStopIndex = currentStopSequence.findIndex(s => s.stopId === stopIdStr);

    if (targetStopIndex === -1) {
      console.warn(`Selected stop ${stopIdStr} not found in route sequence ${routeIdStr}`);
      return res.json({
        arrivals: [],
        lineStopsWithArrivals: [],
        timestamp: headerTime * 1000,
        shouldShowNoDataMessage,
      });
    }

    // Add real arrival at target stop
    const arrivalAtTarget = bestArrivalPerStopId.get(stopIdStr);
    let lastRelevantArrivalTime = -Infinity;
    let tripIdForFrequency = "";

    if (arrivalAtTarget && arrivalAtTarget.estimatedArrivalTime > headerTime) {
      let tripDetailsSourceEntity = externalData.Entity.find(
        e =>
          e.Linea.Route_Id === routeIdStr
          && Number.parseInt(String(e.Linea.Direction_ID), 10) === targetDirectionIdNum
          && e.Linea.Estaciones.some(
            s =>
              s.stop_id === stopIdStr
              && s.arrival?.time
              && arrivalAtTarget.estimatedArrivalTime
              && s.arrival.time === arrivalAtTarget.estimatedArrivalTime - arrivalAtTarget.delaySeconds,
          ),
      );
      if (!tripDetailsSourceEntity) {
        tripDetailsSourceEntity = externalData.Entity.find(
          e =>
            e.Linea.Route_Id === routeIdStr
            && Number.parseInt(String(e.Linea.Direction_ID), 10) === targetDirectionIdNum,
        );
      }

      if (tripDetailsSourceEntity?.Linea.Trip_Id) {
        tripIdForFrequency = tripDetailsSourceEntity.Linea.Trip_Id;
      }

      finalArrivals.push({
        ...arrivalAtTarget,
        tripId: tripDetailsSourceEntity?.ID || `REAL_${stopIdStr}_${arrivalAtTarget.estimatedArrivalTime}`,
        routeId: routeIdStr,
        departureTimeFromTerminal: tripDetailsSourceEntity?.Linea.start_time,
        vehicleId: tripDetailsSourceEntity?.ID,
        isEstimate: false,
      });
      lastRelevantArrivalTime = arrivalAtTarget.estimatedArrivalTime;
    }

    // Find breaks and project (iterating backwards)
    let lastSeenArrival = arrivalAtTarget ? arrivalAtTarget.estimatedArrivalTime : Infinity;
    const durationsForLine = averageDurationsData.lineAverageDurations[lineShortName];

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
            stopIdStr,
            currentStopSequence,
            durationsForLine,
          );
          if (travelTime !== null) {
            const numIntermediateDwells = N;
            const projectedArrivalTime
              = arrivalAtCurrentStop.estimatedArrivalTime
              + travelTime
              + numIntermediateDwells * DWELL_TIME_SECONDS;
            if (projectedArrivalTime > headerTime && projectedArrivalTime > lastRelevantArrivalTime) {
              finalArrivals.push({
                status: arrivalAtCurrentStop.status,
                delaySeconds: arrivalAtCurrentStop.delaySeconds,
                tripId: `ESTIMATE_${N}_FROM_${currentStop.stopId}`,
                routeId: routeIdStr,
                estimatedArrivalTime: projectedArrivalTime,
                isEstimate: true,
              });
              lastRelevantArrivalTime = projectedArrivalTime;
            }
          }
        }
        lastSeenArrival = arrivalAtCurrentStop.estimatedArrivalTime;
      }
    }

    // Sort and limit arrivals
    finalArrivals.sort((a, b) => a.estimatedArrivalTime - b.estimatedArrivalTime);
    const limitedFinalArrivals = finalArrivals.slice(0, MAX_ARRIVALS_TO_RETURN);

    // Build line stops with arrivals
    const lineStopsWithArrivals = currentStopSequence.map((baseStop) => ({
      stopId: baseStop.stopId,
      stopName: baseStop.stopName,
      sequence: baseStop.sequence,
      nextArrival: bestArrivalPerStopId.get(baseStop.stopId),
    }));

    // Get frequency info
    let frequency;
    if (frequenciesData && tripIdForFrequency) {
      const currentFrequency = getCurrentFrequency(tripIdForFrequency, frequenciesData);
      if (currentFrequency) {
        frequency = {
          startTime: currentFrequency.start_time,
          endTime: currentFrequency.end_time,
          headwaySeconds: currentFrequency.headway_secs,
        };
      }
    }

    const responsePayload: RealtimeResponse = {
      arrivals: limitedFinalArrivals,
      lineStopsWithArrivals,
      timestamp: headerTime * 1000,
      frequency,
      shouldShowNoDataMessage,
    };

    return res.json(responsePayload);
  }
  catch (error: unknown) {
    let errorMessage = "Unexpected error processing realtime request";
    let errorStack: string | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    }
    else if (typeof error === "string") {
      errorMessage = error;
    }
    
    console.error(`[API /api/realtime] CATCH GENERAL ERROR: ${errorMessage}`, {
      error,
      stack: errorStack,
      routeId: req.query.routeId,
      stopId: req.query.stopId,
      direction: req.query.direction,
    });
    
    return res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
    });
  }
}

