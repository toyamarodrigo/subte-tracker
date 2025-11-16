import { useEffect, useState } from "react";

export const useCurrentTime = (updateInterval = 1000): Date => {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  return currentTime;
};
