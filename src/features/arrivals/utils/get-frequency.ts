import type { Frequency } from "@/types";

export const getCurrentFrequency = (tripId: string, frequencies: Frequency[]): Frequency | null => {
  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  return frequencies.find((f) => {
    if (f.trip_id !== tripId)
      return false;

    const startParts = f.start_time.split(":").map(Number);
    const endParts = f.end_time.split(":").map(Number);

    const startSeconds = startParts[0] * 3600 + startParts[1] * 60 + (startParts[2] || 0);
    const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + (endParts[2] || 0);

    return currentSeconds >= startSeconds && currentSeconds <= endSeconds;
  }) || null;
};
