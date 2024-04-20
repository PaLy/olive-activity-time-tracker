import { effect, signal } from "@preact/signals-react";
import moment from "moment/moment";

import { humanize, intervalsGroupedByDay } from "./Algorithms";
import { Interval, toSimpleClosedInterval } from "./Interval";
import { Activity } from "../activity/Storage";
import { useActivities } from "../activity/Operations";
import { useMemo } from "react";

export const durationRefreshTime = signal(moment());
export const durationRefreshDisabled = signal(false);

let durationRefreshInterval: number | undefined;
const updateDurationRefreshTime = () => (durationRefreshTime.value = moment());

const clearDurationRefreshInterval = () => {
  clearInterval(durationRefreshInterval);
  durationRefreshInterval = undefined;
};

effect(() => {
  if (!durationRefreshDisabled.value) {
    updateDurationRefreshTime();
    durationRefreshInterval = window.setInterval(
      updateDurationRefreshTime,
      1000,
    );
    return clearDurationRefreshInterval;
  } else {
    clearDurationRefreshInterval();
  }
});

export const useHumanizedDuration = (duration: number, inProgress: boolean) => {
  return useMemo(() => humanize(duration, inProgress), [duration, inProgress]);
};

export const useIntervalDuration = (
  interval: Omit<Interval, "id">,
  full: boolean,
) =>
  useMemo(() => {
    const inProgress = !interval.end;
    const { start, end } = toSimpleClosedInterval(interval);
    const duration = end - start;
    return humanize(duration, inProgress, full);
  }, [full, interval]);

export const useIntervalsGroupedByDay = (activity: Activity) => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return useMemo(
    () => intervalsGroupedByDay(activity, activities),
    [activities, activity],
  );
};
