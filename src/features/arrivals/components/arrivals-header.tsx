import type { FrequencyInfo } from "@/types";

import { FrequencyBadge } from "./frequency-badge";

type ArrivalsHeaderProps = {
  stopName: string;
  routeName: string;
  frequency?: FrequencyInfo;
};

export const ArrivalsHeader = ({ stopName, routeName, frequency }: ArrivalsHeaderProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{stopName}</h1>
        <p className="text-muted-foreground">{routeName}</p>
      </div>
      {frequency && <FrequencyBadge frequency={frequency} />}
    </div>
  );
};
