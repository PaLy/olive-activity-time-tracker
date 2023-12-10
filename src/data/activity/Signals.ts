import { computed, Signal, useComputed } from "@preact/signals-react";
import { Activity, store } from "./Storage";
import {
  activityFullName,
  getChildActivities,
  getDuration,
  getNonRootAncestors,
  isSelfInProgress,
} from "./Algorithms";

import { ClosedInterval } from "../interval/ClosedInterval";

export const activities = computed(() => store.collection.value);

export const rootActivity = computed(() => activities.value.get("root")!);

export const nonRootActivities = computed(() =>
  [...activities.value.values()].filter(
    (activity) => activity !== rootActivity.value,
  ),
);

export const activityFullNames = computed(
  () =>
    new Map(
      [...activities.value.entries()].map(([id, activity]) => [
        id,
        activityFullName(activity),
      ]),
    ),
);

export const inProgressActivities = computed(
  () =>
    new Set(
      nonRootActivities.value
        .filter(isSelfInProgress)
        .flatMap((inProgressActivity) => [
          inProgressActivity,
          ...getNonRootAncestors(inProgressActivity),
        ]),
    ),
);

export const inProgressActivitiesCount = computed(
  () => inProgressActivities.value.size,
);

export const useInProgress = (activity: Signal<Activity>) =>
  useComputed(() => inProgressActivities.value.has(activity.value));

export const useParentActivity = (activity: Signal<Activity>) =>
  useComputed(() => activities.value.get(activity.value.parentID.value)!);

export const useDepth = (activity: Signal<Activity>) =>
  useComputed(() => getNonRootAncestors(activity.value).length);

export const useDuration = (
  activity: Signal<Activity>,
  filter: Signal<ClosedInterval>,
) => useComputed(() => getDuration(activity, filter));

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

export const useChildActivities = (
  activity: Signal<Activity>,
  filter: Signal<ClosedInterval>,
) => useComputed(() => getChildActivities(activity.value, filter.value));
