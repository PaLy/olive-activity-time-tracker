import {
  batch,
  computed,
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

const isInProgress = (activity: Activity) => {
  const { intervals } = activity;
  return (
    intervals.value.length > 0 &&
    !intervals.value[intervals.value.length - 1].value.end
  );
};

const isStopped = (activity: Activity) => !isInProgress(activity);

export const useInProgress = (activity: Signal<Activity>) =>
  useComputed(() => isInProgress(activity.value));

export const useDepth = (activity: Signal<Activity>) =>
  useComputed(() => {
    let cur = activity.value;
    let depth = -1;
    while (cur !== rootActivity) {
      depth++;
      cur = activities.value.get(cur.parentActivityID.value)!.value;
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
    () => activities.value.get(activity.value.parentActivityID.value)!.value,
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
    [activity.value, ...getDescendants(activity.value)]
      .filter(isInProgress)
      .forEach((activity) => {
        const intervals = activity.intervals.value;
        const lastInterval = intervals[intervals.length - 1];
        lastInterval.value = { ...lastInterval.value, end: moment() };
      });
  });
};

export const startActivity = (activity: Signal<Activity>) => {
  batch(() => {
    [activity.value, ...getAncestors(activity.value)]
      .filter(isStopped)
      .forEach((activity) => {
        const { intervals } = activity;
        intervals.value = [...intervals.value, signal({ start: moment() })];
      });
  });
};

const getDescendants = (activity: Activity): Activity[] =>
  activity.childActivityIDs.value
    .map((childID) => activities.value.get(childID)!.value)
    .flatMap((child) => [child, ...getDescendants(child)]) ?? [];

const getAncestorsWithoutRoot = (activity: Activity): Activity[] =>
  getAncestors(activity).slice(0, -1);

const getAncestors = (activity: Activity): Activity[] => {
  const parent = activities.value.get(activity.parentActivityID.value)!.value;
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

export const rootActivity = activities.value.get("root")!.value;

export const nonRootActivities = computed(() =>
  [...activities.value.values()]
    .map((activity) => activity.value)
    .filter((activity) => activity !== rootActivity),
);

export const useInProgressActivitiesCount = () =>
  useComputed(() => nonRootActivities.value.filter(isInProgress).length);

export const activityFullNames = computed(
  () =>
    new Map(
      [...activities.value.entries()].map(([id, activity]) => [
        id,
        activityFullName(activity.value),
      ]),
    ),
);

const activityFullName = (activity: Activity) =>
  getAncestorsWithoutRoot(activity)
    .reverse()
    .concat(activity)
    .map((activity) => activity.name.value)
    .join(" / ");
