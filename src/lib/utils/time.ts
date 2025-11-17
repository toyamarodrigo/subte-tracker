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
    const elapsedMs = Date.now() - serverTimestamp;
    referenceTimeMs = serverTimestamp + elapsedMs;
  }
  else {
    referenceTimeMs = currentTime.getTime();
  }
  
  const diffMs = arrivalTimeMs - referenceTimeMs;
  const diffSecondsTotal = Math.round(diffMs / 1000);

  if (diffSecondsTotal <= 10)
    return "Llegando";
  if (diffSecondsTotal < 0)
    return "Llegando";
  if (diffSecondsTotal < 60)
    return ">1 min";

  const minutes = Math.ceil(diffSecondsTotal / 60);

  return `${minutes} min`;
};
