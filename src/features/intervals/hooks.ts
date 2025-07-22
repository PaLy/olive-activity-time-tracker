import { useMemo } from "react";
import { MAX_DATE_MS } from "../../utils/Date";
import { humanize } from "../../utils/duration";

import { useClockStore } from "../../utils/clock";

export const useIntervalDuration = (
  start: number,
  end: number,
  full: boolean,
) => {
  const time = useClockStore((state) => state.time);
  return useMemo(() => {
    const inProgress = end === MAX_DATE_MS;
    const effectiveEnd = inProgress ? +time : end;
    const duration = effectiveEnd - start;
    return humanize(duration, inProgress, full);
  }, [full, start, end, time]);
};
