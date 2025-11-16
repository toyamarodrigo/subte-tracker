import { Link } from "@tanstack/react-router";

import type { Stop } from "@/types";

import { Card } from "@/components/ui/card";

type StopListProps = {
  stops: Stop[];
  routeId: string;
  onStopSelect?: (stop: Stop) => void;
};

export const StopList = ({ stops, routeId, onStopSelect }: StopListProps) => {
  if (stops.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No se encontraron estaciones
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stops.map(stop => (
        <Link
          key={stop.stop_id}
          to="/line/$lineId/$stopId"
          params={{ lineId: routeId, stopId: stop.stop_id }}
          onClick={() => onStopSelect?.(stop)}
        >
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-medium">{stop.stop_name}</h3>
          </Card>
        </Link>
      ))}
    </div>
  );
};
