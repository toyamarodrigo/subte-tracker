import type { ArrivalInfo } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCurrentTime } from "@/hooks/use-current-time";
import { formatTime, getTimeUntilArrival } from "@/lib/utils/time";

type ArrivalCardProps = {
  arrival: ArrivalInfo;
};

export const ArrivalCard = ({ arrival }: ArrivalCardProps) => {
  const currentTime = useCurrentTime();
  const timeUntil = getTimeUntilArrival(arrival.estimatedArrivalTime, currentTime);
  const formattedTime = formatTime(arrival.estimatedArrivalTime);

  const statusColors = {
    "on-time": "bg-green-500",
    "delayed": "bg-red-500",
    "early": "bg-blue-500",
    "unknown": "bg-gray-500",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold">{timeUntil}</span>
            {arrival.isEstimate && (
              <Badge variant="outline">Estimado</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {formattedTime}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[arrival.status]}`} />
          {arrival.delaySeconds !== 0 && (
            <span className="text-xs text-muted-foreground">
              {arrival.delaySeconds > 0 ? "+" : ""}
              {Math.round(arrival.delaySeconds / 60)}
              {" "}
              min
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
