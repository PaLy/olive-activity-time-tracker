import { computed, Signal, useComputed } from "@preact/signals-react";
import { Activity, activityStore } from "./Storage";
import {
  activityFullName,
  getSubtreeActivityIDsByDuration,
  getChildActivitiesByDuration,
  getDuration,
  getNonRootAncestors,
  isSelfInProgress,
  ACTIVITY_FULL_NAME_SEPARATOR,
} from "./Algorithms";

import { ClosedInterval } from "../interval/ClosedInterval";

export const activities = computed(() => activityStore.collection.value);

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
) => useComputed(() => getDuration(activity.value, filter.value));

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

export const useChildActivitiesByDuration = (
  activity: Signal<Activity>,
  filter: Signal<ClosedInterval>,
) =>
  useComputed(() => getChildActivitiesByDuration(activity.value, filter.value));

export const useActivitiesOrderKey = (filter: Signal<ClosedInterval>) =>
  useComputed(() =>
    // should be joined by a character which is not used in any ID
    getSubtreeActivityIDsByDuration(rootActivity.value, filter.value).join("$"),
  );

export const useActivityPath = (activity: Activity, ancestor?: Activity) =>
  useComputed(() => {
    const finalAncestor = ancestor ?? rootActivity.value;
    const ancestorFullname = activityFullNames.value.get(finalAncestor.id)!;
    const activityFullname = activityFullNames.value.get(activity.id)!;
    const separatorLength =
      finalAncestor !== rootActivity.value
        ? ACTIVITY_FULL_NAME_SEPARATOR.length
        : 0;
    return activityFullname.substring(
      ancestorFullname.length + separatorLength,
    );
  });
