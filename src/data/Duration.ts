import { Signal, useComputed } from "@preact/signals-react";
import humanizeDuration from "humanize-duration";

export const useHumanizedDuration = (
  duration: Signal<number>,
  inProgress: Signal<boolean>,
) => useComputed(() => humanize(duration.value, inProgress.value));

export const humanize = (duration: number, inProgress: boolean) =>
  humanizeDuration(duration, {
    delimiter: " ",
    largest: inProgress ? Infinity : 2,
    round: true,
    units: inProgress
      ? ["y", "mo", "w", "d", "h", "m", "s"]
      : ["y", "mo", "w", "d", "h", "m"],
  });
