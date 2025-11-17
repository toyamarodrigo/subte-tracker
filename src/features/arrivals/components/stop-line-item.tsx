import type { StopWithArrival } from "@/types";

import { Card } from "@/components/ui/card";
import { useCurrentTime } from "@/hooks/use-current-time";
import { formatTime, getTimeUntilArrival } from "@/lib/utils/time";

type StopLineItemProps = {
  stop: StopWithArrival;
  isSelected?: boolean;
  serverTimestamp?: number;
};

export const StopLineItem = ({ stop, isSelected, serverTimestamp }: StopLineItemProps) => {
  const currentTime = useCurrentTime();

  return (
    <Card className={`p-3 ${isSelected ? "ring-2 ring-primary" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium">{stop.stopName}</div>
          {stop.nextArrival && (
            <div className="text-sm text-muted-foreground">
              {getTimeUntilArrival(stop.nextArrival.estimatedArrivalTime, currentTime, serverTimestamp)}
              {" "}
              -
              {formatTime(stop.nextArrival.estimatedArrivalTime)}
            </div>
          )}
        </div>
        {stop.nextArrival && (
          <div className="text-lg font-semibold">
            {getTimeUntilArrival(stop.nextArrival.estimatedArrivalTime, currentTime, serverTimestamp)}
          </div>
        )}
      </div>
    </Card>
  );
};
