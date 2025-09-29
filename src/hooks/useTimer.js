import { useEffect, useState } from "react";

export default function useTimer(initialSeconds, onComplete) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, onComplete]);

  const reset = (time) => setSeconds(time);

  return { seconds, reset };
}
