import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { Stop } from "@/types";

import { stopsQueryOptions } from "../hooks/use-stops-query";
import { StopList } from "./stop-list";
import { StopSearchInput } from "./stop-search-input";

type StopSelectorProps = {
  routeId: string;
  onStopSelect?: (stop: Stop) => void;
};

export const StopSelector = ({ routeId, onStopSelect }: StopSelectorProps) => {
  const { data: allStops } = useSuspenseQuery(stopsQueryOptions);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStops = useMemo(() => {
    if (!searchQuery.trim())
      return allStops;

    const queryLower = searchQuery.toLowerCase();

    return allStops.filter(stop =>
      stop.stop_name.toLowerCase().includes(queryLower),
    );
  }, [allStops, searchQuery]);

  return (
    <div className="space-y-4">
      <StopSearchInput value={searchQuery} onChange={setSearchQuery} />
      <StopList stops={filteredStops} routeId={routeId} onStopSelect={onStopSelect} />
    </div>
  );
};
