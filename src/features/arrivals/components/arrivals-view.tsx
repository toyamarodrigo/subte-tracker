import type { RealtimeResponse } from "@/types";

import { ArrivalsHeader } from "./arrivals-header";
import { ArrivalsList } from "./arrivals-list";
import { StopLineView } from "./stop-line-view";

type ArrivalsViewProps = {
  data: RealtimeResponse;
  stopName: string;
  routeName: string;
  selectedStopId?: string;
  isFetching?: boolean;
};

export const ArrivalsView = ({
  data,
  stopName,
  routeName,
  selectedStopId,
  isFetching,
}: ArrivalsViewProps) => {
  if (data.shouldShowNoDataMessage) {
    return (
      <div className="text-center text-muted-foreground py-8">
        El GCBA no reporta datos para esta línea
      </div>
    );
  }

  const serverTimestamp = data.timestamp;

  return (
    <div className="space-y-6">
      <ArrivalsHeader
        stopName={stopName}
        routeName={routeName}
        frequency={data.frequency}
        timestamp={data.timestamp}
        isFetching={isFetching}
      />
      <div>
        <h2 className="text-lg font-semibold mb-4">Próximos arribos</h2>
        <ArrivalsList arrivals={data.arrivals} serverTimestamp={serverTimestamp} />
      </div>
      {data.lineStopsWithArrivals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Estaciones en la línea</h2>
          <StopLineView
            stops={data.lineStopsWithArrivals}
            selectedStopId={selectedStopId}
            serverTimestamp={serverTimestamp}
          />
        </div>
      )}
    </div>
  );
};
