import { addInterval, ClosedInterval, Interval, intervals } from "../Interval";
import {
  batch,
  computed,
  effect,
  signal,
  Signal,
  useComputed,
} from "@preact/signals-react";
import moment, { max, min } from "moment";
import { duration } from "moment/moment";
import { nanoid } from "nanoid";
import { activities, Activity } from "../Activity";

const isInProgress = (activity: Activity) => {
  const { intervalIds } = activity;
  const lastIntervalId = intervalIds.value.slice(-1)[0];
  return !!lastIntervalId && !intervals.value.get(lastIntervalId)!.end.value;
};

const isStopped = (activity: Activity) => !isInProgress(activity);

export const useInProgress = (activity: Signal<Activity>) =>
  useComputed(() => isInProgress(activity.value));

export const useDepth = (activity: Signal<Activity>) =>
  useComputed(() => {
    let cur = activity.value;
    let depth = -1;
    while (cur !== rootActivity.value) {
      depth++;
      cur = activities.value.get(cur.parentActivityID.value)!;
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
  filter: Signal<ClosedInterval>,
) =>
  activity.value.intervalIds.value
    .map((id) => intervals.value.get(id)!)
    .map((interval) => {
      const filteredEnd = min(
        interval.end.value ?? durationRefreshTime.value,
        moment(filter.value.end.value),
      );
      const filteredStart = max(
        interval.start.value,
        moment(filter.value.start.value),
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
  filter: Signal<ClosedInterval>,
) => useComputed(() => getDuration(activity, filter));

export const useParentActivity = (activity: Signal<Activity>) =>
  useComputed(
    () => activities.value.get(activity.value.parentActivityID.value)!,
  );

export const useDurationPercentage = (
  activity: Signal<Activity>,
  filter: Signal<ClosedInterval>,
) => {
  const parentActivity = useParentActivity(activity);
  const activityDuration = useDuration(activity, filter);
  const parentDuration = useDuration(parentActivity, filter);
  return useComputed(() =>
    Math.round((activityDuration.value / parentDuration.value) * 100),
  );
};

const getIntervals = (activity: Activity) =>
  activity.intervalIds.value.map((id) => intervals.value.get(id)!);

export const stopActivity = (activity: Activity) => {
  batch(() => {
    [activity, ...getDescendants(activity)]
      .filter(isInProgress)
      .forEach((activity) => {
        getIntervals(activity).slice(-1)[0].end.value = moment();
      });
  });
};

export const startActivity = (activity: Activity) => {
  batch(() => {
    [activity, ...getAncestors(activity)]
      .filter(isStopped)
      .forEach((activity) => {
        const id = nanoid();
        addInterval({ id, start: signal(moment()), end: signal(null) });
        activity.intervalIds.value = [...activity.intervalIds.value, id];
      });
  });
};

const getDescendants = (activity: Activity): Activity[] =>
  activity.childActivityIDs.value
    .map((childID) => activities.value.get(childID)!)
    .flatMap((child) => [child, ...getDescendants(child)]) ?? [];

const getAncestorsWithoutRoot = (activity: Activity): Activity[] =>
  getAncestors(activity).slice(0, -1);

const getAncestors = (activity: Activity): Activity[] => {
  const parent = activities.value.get(activity.parentActivityID.value)!;
  return parent === rootActivity.value
    ? [rootActivity.value]
    : [parent, ...getAncestors(parent)];
};

const overlaps = (interval1: ClosedInterval, interval2: Interval) => {
  const start1 = moment(interval1.start.value);
  const end1 = moment(interval1.end.value);
  const start2 = interval2.start.value;
  const end2 = interval2.end.value ?? durationRefreshTime.value;
  return start1.isSameOrBefore(end2) && end1.isSameOrAfter(start2);
};

const getChildActivities = (activity: Activity, filter: ClosedInterval) =>
  activity.childActivityIDs.value
    .map((childID) => activities.value.get(childID)!)
    .filter((child) =>
      getIntervals(child).some((interval) => overlaps(filter, interval)),
    );

export const useChildActivities = (
  activity: Signal<Activity>,
  filter: Signal<ClosedInterval>,
) => useComputed(() => getChildActivities(activity.value, filter.value));

export const rootActivity = computed(() => activities.value.get("root")!);

export const nonRootActivities = computed(() =>
  [...activities.value.values()]
    .map((activity) => activity)
    .filter((activity) => activity !== rootActivity.value),
);

export const useInProgressActivitiesCount = () =>
  useComputed(() => nonRootActivities.value.filter(isInProgress).length);

export const activityFullNames = computed(
  () =>
    new Map(
      [...activities.value.entries()].map(([id, activity]) => [
        id,
        activityFullName(activity),
      ]),
    ),
);

const activityFullName = (activity: Activity) =>
  getAncestorsWithoutRoot(activity)
    .reverse()
    .concat(activity)
    .map((activity) => activity.name.value)
    .join(" / ");
