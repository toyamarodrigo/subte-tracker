import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { Stop } from "@/types";

import { realtimeQueryOptions } from "@/features/arrivals/hooks/use-realtime-query";

import { routeToStopsQueryOptions } from "../hooks/use-route-to-stops-query";
import { stopsQueryOptions } from "../hooks/use-stops-query";
import { StopList } from "./stop-list";
import { StopSearchInput } from "./stop-search-input";

type StopSelectorProps = {
  routeId: string;
  onStopSelect?: (stop: Stop) => void;
};

export const StopSelector = ({ routeId, onStopSelect }: StopSelectorProps) => {
  const { data: allStops } = useSuspenseQuery(stopsQueryOptions);
  const { data: routeToStops } = useSuspenseQuery(routeToStopsQueryOptions);
  const [searchQuery, setSearchQuery] = useState("");

  const firstStopId = useMemo(() => {
    const directionKey = `${routeId}_0`;
    const stops = routeToStops[directionKey] || [];

    return stops[0]?.stopId;
  }, [routeToStops, routeId]);

  const { data: realtimeData, isLoading: isLoadingRealtime, error: realtimeError } = useQuery({
    ...realtimeQueryOptions(routeId, firstStopId || "", "0"),
    enabled: !!firstStopId,
  });

  const filteredStops = useMemo(() => {
    const stopsForRoute = new Set<string>();

    for (const directionId of ["0", "1"]) {
      const directionKey = `${routeId}_${directionId}`;
      const stops = routeToStops[directionKey] || [];

      for (const stop of stops) {
        stopsForRoute.add(stop.stopId);
      }
    }

    let stops = allStops.filter(stop => stopsForRoute.has(stop.stop_id));

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();

      stops = stops.filter(stop =>
        stop.stop_name.toLowerCase().includes(queryLower),
      );
    }

    const seenStopNames = new Set<string>();
    const uniqueStops: Stop[] = [];

    for (const stop of stops) {
      if (!seenStopNames.has(stop.stop_name)) {
        seenStopNames.add(stop.stop_name);
        uniqueStops.push(stop);
      }
    }

    return uniqueStops;
  }, [allStops, routeToStops, routeId, searchQuery]);

  return (
    <div className="space-y-4">
      <StopSearchInput value={searchQuery} onChange={setSearchQuery} />
      {isLoadingRealtime && (
        <div className="text-sm text-muted-foreground py-2">
          Cargando datos en tiempo real...
        </div>
      )}
      {realtimeError && (
        <div className="text-sm text-muted-foreground py-2">
          No se pudieron cargar los datos en tiempo real
        </div>
      )}
      <StopList
        stops={filteredStops}
        routeId={routeId}
        stopsWithArrivals={realtimeData?.lineStopsWithArrivals}
        onStopSelect={onStopSelect}
      />
    </div>
  );
};
