import type { FrequencyInfo } from "@/types";

import { useCurrentTime } from "@/hooks/use-current-time";
import { formatTime } from "@/lib/utils/time";

import { FrequencyBadge } from "./frequency-badge";

type ArrivalsHeaderProps = {
  stopName: string;
  routeName: string;
  frequency?: FrequencyInfo;
  timestamp?: number;
  isFetching?: boolean;
};

export const ArrivalsHeader = ({
  stopName,
  routeName,
  frequency,
  timestamp,
  isFetching,
}: ArrivalsHeaderProps) => {
  const currentTime = useCurrentTime();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{stopName}</h1>
        <p className="text-muted-foreground">{routeName}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          <span>Hora: </span>
          <span className="font-mono">
            {currentTime.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        {timestamp && (
          <div>
            <span>Act: </span>
            <span className="font-mono">{formatTime(timestamp / 1000, true)}</span>
          </div>
        )}
      </div>

      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Actualizando...</span>
        </div>
      )}

      {frequency && <FrequencyBadge frequency={frequency} />}
    </div>
  );
};
