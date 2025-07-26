import humanizeDuration from "humanize-duration";
import { useMemo } from "react";

export const humanize = (duration: number, showAllUnits: boolean) => {
  if (!showAllUnits && duration < 59.5 * 1000) {
    return "less than a minute";
  } else {
    return humanizeDuration(duration, {
      delimiter: " ",
      largest: showAllUnits ? Infinity : 2,
      round: true,
      units: showAllUnits
        ? ["y", "mo", "w", "d", "h", "m", "s"]
        : ["y", "mo", "w", "d", "h", "m"],
    });
  }
};

export const useHumanizedDuration = (duration: number, inProgress: boolean) => {
  return useMemo(() => humanize(duration, inProgress), [duration, inProgress]);
};
