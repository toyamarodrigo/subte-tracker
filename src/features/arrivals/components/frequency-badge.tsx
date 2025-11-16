import type { FrequencyInfo } from "@/types";

import { Badge } from "@/components/ui/badge";

type FrequencyBadgeProps = {
  frequency: FrequencyInfo;
};

const formatHeadwayTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const FrequencyBadge = ({ frequency }: FrequencyBadgeProps) => {
  const headwayFormatted = formatHeadwayTime(frequency.headwaySeconds);

  return (
    <Badge variant="secondary" className="text-sm">
      En este horario (
      {frequency.startTime}
      {" "}
      -
      {" "}
      {frequency.endTime}
      ) la frecuencia es de
      {" "}
      {headwayFormatted}
      {" "}
      entre trenes.
    </Badge>
  );
};
