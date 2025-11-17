import type { ArrivalInfo } from "@/types";

import { ArrivalCard } from "./arrival-card";

type ArrivalsListProps = {
  arrivals: ArrivalInfo[];
  serverTimestamp?: number;
};

export const ArrivalsList = ({ arrivals, serverTimestamp }: ArrivalsListProps) => {
  if (arrivals.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No hay arribos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {arrivals.map(arrival => (
        <ArrivalCard key={arrival.tripId} arrival={arrival} serverTimestamp={serverTimestamp} />
      ))}
    </div>
  );
};
