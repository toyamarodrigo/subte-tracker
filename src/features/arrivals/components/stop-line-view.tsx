import type { StopWithArrival } from "@/types";

import { StopLineItem } from "./stop-line-item";

type StopLineViewProps = {
  stops: StopWithArrival[];
  selectedStopId?: string;
};

export const StopLineView = ({ stops, selectedStopId }: StopLineViewProps) => {
  return (
    <div className="space-y-2">
      {stops.map(stop => (
        <StopLineItem
          key={stop.stopId}
          stop={stop}
          isSelected={stop.stopId === selectedStopId}
        />
      ))}
    </div>
  );
};
