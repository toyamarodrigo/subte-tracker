import type { FrequencyInfo } from "@/types";

import { Badge } from "@/components/ui/badge";

type FrequencyBadgeProps = {
  frequency: FrequencyInfo;
};

export const FrequencyBadge = ({ frequency }: FrequencyBadgeProps) => {
  const minutes = Math.round(frequency.headwaySeconds / 60);

  return (
    <Badge variant="secondary">
      Frecuencia: cada
      {" "}
      {minutes}
      {" "}
      min (
      {frequency.startTime}
      {" "}
      -
      {" "}
      {frequency.endTime}
      )
    </Badge>
  );
};
