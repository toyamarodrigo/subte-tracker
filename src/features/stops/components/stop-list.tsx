import { Link } from "@tanstack/react-router";

import type { Stop, StopWithArrival } from "@/types";

import { Card } from "@/components/ui/card";
import { useCurrentTime } from "@/hooks/use-current-time";
import { formatTime, getTimeUntilArrival } from "@/lib/utils/time";

type StopListProps = {
  stops: Stop[];
  routeId: string;
  stopsWithArrivals?: StopWithArrival[];
  onStopSelect?: (stop: Stop) => void;
};

export const StopList = ({ stops, routeId, stopsWithArrivals, onStopSelect }: StopListProps) => {
  const currentTime = useCurrentTime();

  if (stops.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No se encontraron estaciones
      </div>
    );
  }

  const getArrivalForStop = (stopId: string, stopName: string) => {
    if (!stopsWithArrivals)
      return undefined;
    const arrival = stopsWithArrivals.find(s => s.stopId === stopId || s.stopName === stopName);

    return arrival?.nextArrival;
  };

  return (
    <div className="space-y-2">
      {stops.map((stop) => {
        const arrival = getArrivalForStop(stop.stop_id, stop.stop_name);

        return (
          <Link
            key={stop.stop_id}
            to="/line/$lineId/$stopId"
            params={{ lineId: routeId, stopId: stop.stop_id }}
            onClick={() => onStopSelect?.(stop)}
          >
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{stop.stop_name}</h3>
                  {arrival && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {getTimeUntilArrival(arrival.estimatedArrivalTime, currentTime)}
                      {" "}
                      -
                      {" "}
                      {formatTime(arrival.estimatedArrivalTime)}
                    </div>
                  )}
                </div>
                {arrival && (
                  <div className="text-lg font-semibold ml-4">
                    {getTimeUntilArrival(arrival.estimatedArrivalTime, currentTime)}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
