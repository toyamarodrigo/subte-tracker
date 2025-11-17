import type { ArrivalInfo } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCurrentTime } from "@/hooks/use-current-time";
import { formatTime, getTimeUntilArrival } from "@/lib/utils/time";

type ArrivalCardProps = {
  arrival: ArrivalInfo;
  serverTimestamp?: number;
};

export const ArrivalCard = ({ arrival, serverTimestamp }: ArrivalCardProps) => {
  const currentTime = useCurrentTime();
  const timeUntil = getTimeUntilArrival(arrival.estimatedArrivalTime, currentTime, serverTimestamp);
  const formattedTime = formatTime(arrival.estimatedArrivalTime);

  const arrivalTimeMs = arrival.estimatedArrivalTime ? arrival.estimatedArrivalTime * 1000 : 0;
  let referenceTimeMs: number;

  if (serverTimestamp !== undefined) {
    const clientTimeNow = currentTime.getTime();
    const elapsedMs = clientTimeNow - serverTimestamp;

    referenceTimeMs = serverTimestamp + elapsedMs;
  }
  else {
    referenceTimeMs = currentTime.getTime();
  }

  const diffSeconds = arrival.estimatedArrivalTime
    ? Math.round((arrivalTimeMs - referenceTimeMs) / 1000)
    : Infinity;

  let colorClass = "text-blue-600";
  let animateClass = "";

  if (diffSeconds <= 30) {
    colorClass = "text-red-600";
    animateClass = "animate-pulse";
  }
  else if (diffSeconds <= 60) {
    colorClass = "text-red-600";
  }

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
            <span className={`text-2xl font-bold ${colorClass} ${animateClass}`}>
              {timeUntil}
            </span>
            {arrival.isEstimate && <Badge variant="outline">Estimado</Badge>}
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
