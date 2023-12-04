import {
  batch,
  effect,
  signal,
  Signal,
  useComputed,
} from "@preact/signals-react";
import { activities, Activity, ActivityInterval } from "./Model";
import { duration } from "moment/moment";
import moment, { max, min } from "moment";

export type Interval = {
  start: number;
  end: number;
};

const isInProgress = (activity: Signal<Activity>) => {
  const { intervals } = activity.value;
  return (
    intervals.value.length > 0 &&
    !intervals.value[intervals.value.length - 1].value.end
  );
};

const isStopped = (activity: Signal<Activity>) => !isInProgress(activity);

export const useInProgress = (activity: Signal<Activity>) =>
  useComputed(() => isInProgress(activity));

export const useDepth = (activity: Signal<Activity>) =>
  useComputed(() => {
    let cur = activity;
    let depth = -1;
    while (cur !== rootActivity) {
      depth++;
      cur = activities.value.get(cur.value.parentActivityID)!;
    }
    return depth;
  });

export const durationRefreshTime = signal(moment());
effect(() => {
  const interval = window.setInterval(
    () => (durationRefreshTime.value = moment()),
    1000,
  );
  return () => clearInterval(interval);
});

export const getDuration = (
  activity: Signal<Activity>,
  filter: Signal<Interval>,
) =>
  activity.value.intervals.value
    .map((interval) => {
      const filteredEnd = min(
        interval.value.end ?? durationRefreshTime.value,
        moment(filter.value.end),
      );
      const filteredStart = max(
        interval.value.start,
        moment(filter.value.start),
      );
      if (filteredStart.isBefore(filteredEnd)) {
        return duration(filteredEnd.diff(filteredStart));
      } else {
        return duration(0);
      }
    })
    .reduce((prev, cur) => prev.add(cur), duration())
    .asMilliseconds();

export const useDuration = (
  activity: Signal<Activity>,
  interval: Signal<Interval>,
) => useComputed(() => getDuration(activity, interval));

export const useParentActivity = (activity: Signal<Activity>) =>
  useComputed(
    () => activities.value.get(activity.value.parentActivityID)!.value,
  );

export const useDurationPercentage = (
  activity: Signal<Activity>,
  interval: Signal<Interval>,
) => {
  const parentActivity = useParentActivity(activity);
  const activityDuration = useDuration(activity, interval);
  const parentDuration = useDuration(parentActivity, interval);
  return useComputed(() =>
    Math.round((activityDuration.value / parentDuration.value) * 100),
  );
};

export const stopActivity = (activity: Signal<Activity>) => {
  batch(() => {
    [activity, ...getDescendants(activity)]
      .filter(isInProgress)
      .forEach((activity) => {
        const intervals = activity.value.intervals.value;
        const lastInterval = intervals[intervals.length - 1];
        lastInterval.value = { ...lastInterval.value, end: moment() };
      });
  });
};

export const startActivity = (activity: Signal<Activity>) => {
  batch(() => {
    [activity, ...getAncestors(activity)]
      .filter(isStopped)
      .forEach((activity) => {
        const { intervals } = activity.value;
        intervals.value = [...intervals.value, signal({ start: moment() })];
      });
  });
};

const getDescendants = (activity: Signal<Activity>): Signal<Activity>[] =>
  activity.value.childActivityIDs.value
    .map((childID) => activities.value.get(childID)!)
    .flatMap((child) => [child, ...getDescendants(child)]) ?? [];

const getAncestors = (activity: Signal<Activity>): Signal<Activity>[] => {
  const parent = activities.value.get(activity.value.parentActivityID)!;
  return parent === rootActivity
    ? [rootActivity]
    : [parent, ...getAncestors(parent)];
};

const overlaps = (
  interval1: Signal<Interval>,
  interval2: Signal<ActivityInterval>,
) => {
  const start1 = moment(interval1.value.start);
  const end1 = moment(interval1.value.end);
  const start2 = interval2.value.start;
  const end2 = interval2.value.end ?? durationRefreshTime.value;
  return start1.isSameOrBefore(end2) && end1.isSameOrAfter(start2);
};

const getChildActivities = (
  activity: Signal<Activity>,
  filter: Signal<Interval>,
) =>
  activity.value.childActivityIDs.value
    .map((childID) => activities.value.get(childID)!)
    .filter((child) =>
      child.value.intervals.value.some((interval) =>
        overlaps(filter, interval),
      ),
    );

export const useChildActivities = (
  activity: Signal<Activity>,
  interval: Signal<Interval>,
) => useComputed(() => getChildActivities(activity, interval));

export const rootActivity = activities.value.get("root")!;

export const useInProgressActivitiesCount = () =>
  useComputed(
    () =>
      [...activities.value.values()]
        .filter((a) => a !== rootActivity)
        .filter(isInProgress).length,
  );
