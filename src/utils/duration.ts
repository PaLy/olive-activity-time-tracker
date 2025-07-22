import humanizeDuration from "humanize-duration";
import { useMemo } from "react";

export const humanize = (
  duration: number,
  inProgress: boolean,
  full?: boolean,
) => {
  return humanizeDuration(duration, {
    delimiter: " ",
    largest: inProgress || full ? Infinity : 2,
    round: true,
    units:
      inProgress || full || duration < 59.5 * 1000
        ? ["y", "mo", "w", "d", "h", "m", "s"]
        : ["y", "mo", "w", "d", "h", "m"],
  });
};

export const useHumanizedDuration = (duration: number, inProgress: boolean) => {
  return useMemo(() => humanize(duration, inProgress), [duration, inProgress]);
};
