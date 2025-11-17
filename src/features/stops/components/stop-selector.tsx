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
  directionId?: string;
  onStopSelect?: (stop: Stop) => void;
};

export const StopSelector = ({ routeId, directionId, onStopSelect }: StopSelectorProps) => {
  const { data: allStops } = useSuspenseQuery(stopsQueryOptions);
  const { data: routeToStops } = useSuspenseQuery(routeToStopsQueryOptions);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedDirectionId = directionId || "0";

  const stopsForDirection = useMemo(() => {
    const directionKey = `${routeId}_${selectedDirectionId}`;
    const stops = routeToStops[directionKey] || [];

    return stops.map(s => s.stopId);
  }, [routeToStops, routeId, selectedDirectionId]);

  const firstStopId = useMemo(() => {
    return stopsForDirection[0];
  }, [stopsForDirection]);

  const { data: realtimeData, isLoading: isLoadingRealtime, error: realtimeError } = useQuery({
    ...realtimeQueryOptions(routeId, firstStopId || "", selectedDirectionId),
    enabled: !!firstStopId && !!selectedDirectionId,
  });

  const filteredStops = useMemo(() => {
    let stops = allStops.filter(stop => stopsForDirection.includes(stop.stop_id));

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();

      stops = stops.filter(stop =>
        stop.stop_name.toLowerCase().includes(queryLower),
      );
    }

    return stops;
  }, [allStops, stopsForDirection, searchQuery]);

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
        serverTimestamp={realtimeData?.timestamp}
      />
    </div>
  );
};
