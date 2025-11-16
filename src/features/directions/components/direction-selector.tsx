import { useSuspenseQuery } from "@tanstack/react-query";

import { directionsQueryOptions } from "../hooks/use-directions-query";
import { DirectionCard } from "./direction-card";

type DirectionSelectorProps = {
  routeId: string;
  stopId: string;
};

export const DirectionSelector = ({ routeId, stopId }: DirectionSelectorProps) => {
  const { data: directions } = useSuspenseQuery(directionsQueryOptions(routeId, stopId));

  if (directions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No se encontraron direcciones
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {directions.map(direction => (
        <DirectionCard
          key={direction.rawDirectionId}
          direction={direction}
          routeId={routeId}
          stopId={stopId}
        />
      ))}
    </div>
  );
};
