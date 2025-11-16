import { Link } from "@tanstack/react-router";

import type { DirectionOption } from "@/types";

import { Card } from "@/components/ui/card";

type DirectionCardProps = {
  direction: DirectionOption;
  routeId: string;
  stopId: string;
};

export const DirectionCard = ({ direction, routeId, stopId }: DirectionCardProps) => {
  return (
    <Link
      to="/line/$lineId/$stopId/$directionId"
      params={{
        lineId: routeId,
        stopId,
        directionId: String(direction.rawDirectionId),
      }}
      className="block"
    >
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {direction.directionDisplayName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Desde
              {" "}
              {direction.selectedStopName}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
