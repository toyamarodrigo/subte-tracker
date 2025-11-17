export const formatTime = (
  timestampInSeconds: number | undefined,
  includeSeconds = false,
): string => {
  if (
    timestampInSeconds === null
    || timestampInSeconds === undefined
    || Number.isNaN(timestampInSeconds)
  ) {
    return "N/A";
  }

  const date = new Date(timestampInSeconds * 1000);

  if (Number.isNaN(date.getTime()))
    return "Hora Inválida";

  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: includeSeconds ? "2-digit" : undefined,
  });
};

export const getTimeUntilArrival = (
  arrivalTimestampInSeconds: number | undefined,
  currentTime: Date,
  serverTimestamp?: number,
): string => {
  if (arrivalTimestampInSeconds === undefined || Number.isNaN(arrivalTimestampInSeconds)) {
    return "N/A";
  }

  const arrivalTimeMs = arrivalTimestampInSeconds * 1000;

  let referenceTimeMs: number;

  if (serverTimestamp !== undefined) {
    const clientTimeNow = currentTime.getTime();
    const elapsedMs = clientTimeNow - serverTimestamp;

    referenceTimeMs = serverTimestamp + elapsedMs;
  }
  else {
    referenceTimeMs = currentTime.getTime();
  }

  const diffMs = arrivalTimeMs - referenceTimeMs;
  const diffSecondsTotal = Math.round(diffMs / 1000);

  if (diffSecondsTotal <= 30)
    return "Llegando";
  if (diffSecondsTotal < 0)
    return "Llegando";
  if (diffSecondsTotal < 120) {
    return "~1 min";
  }
  if (diffSecondsTotal < 600) {
    const minutes = Math.round(diffSecondsTotal / 60 / 5) * 5;

    if (minutes < 5)
      return "~5 min";

    return `~${minutes} min`;
  }
  if (diffSecondsTotal < 1200) {
    const minutes = Math.round(diffSecondsTotal / 60 / 10) * 10;

    return `~${minutes} min`;
  }

  const minutes = Math.round(diffSecondsTotal / 60 / 5) * 5;

  return `~${minutes} min`;
};
