import type { RealtimeResponse } from "@/types";

import { ArrivalsHeader } from "./arrivals-header";
import { ArrivalsList } from "./arrivals-list";
import { StopLineView } from "./stop-line-view";

type ArrivalsViewProps = {
  data: RealtimeResponse;
  stopName: string;
  routeName: string;
  selectedStopId?: string;
};

export const ArrivalsView = ({
  data,
  stopName,
  routeName,
  selectedStopId,
}: ArrivalsViewProps) => {
  if (data.shouldShowNoDataMessage) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No hay datos disponibles para esta línea
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ArrivalsHeader
        stopName={stopName}
        routeName={routeName}
        frequency={data.frequency}
      />
      <div>
        <h2 className="text-lg font-semibold mb-4">Próximos arribos</h2>
        <ArrivalsList arrivals={data.arrivals} />
      </div>
      {data.lineStopsWithArrivals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Estaciones en la línea</h2>
          <StopLineView
            stops={data.lineStopsWithArrivals}
            selectedStopId={selectedStopId}
          />
        </div>
      )}
    </div>
  );
};
