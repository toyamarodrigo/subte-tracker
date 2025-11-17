import type { RealtimeResponse } from "@/types";

export const fetchRealtime = async (
  routeId: string,
  stopId: string,
  direction: string,
): Promise<RealtimeResponse> => {
  const params = new URLSearchParams({
    routeId,
    stopId,
    direction,
  });

  const response = await fetch(`/api/realtime?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `Error ${response.status} from server`,
    }));

    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  return response.json();
};
