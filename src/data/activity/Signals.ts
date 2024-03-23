import { computed, signal, Signal, useComputed } from "@preact/signals-react";
import { Activity, activityStore } from "./Storage";
import {
  activityFullName,
  getActivityIDsByOrder,
  getDuration,
  getNonRootAncestors,
  isSelfInProgress,
  ACTIVITY_FULL_NAME_SEPARATOR,
  getChildActivities,
  OrderBy,
} from "./Algorithms";

import { ClosedInterval } from "../interval/ClosedInterval";

export const activities = computed(() => activityStore.collection.value);

export const rootActivity = computed(() => activities.value.get("root")!.value);

export const nonRootActivities = computed(() =>
  [...activities.value.values()].filter(
    (activity) => activity.value !== rootActivity.value,
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
  useComputed(() =>
    [...inProgressActivities.value.values()].some(
      (a) => a.value === activity.value,
    ),
  );

export const useParentActivity = (activity: Signal<Activity>) =>
  useComputed(() => activities.value.get(activity.value.parentID.value)!.value);

export const useDepth = (activity: Signal<Activity>) =>
  useComputed(() => getNonRootAncestors(activity).length);

export const useDuration = (
  activity: Signal<Activity>,
  filter: Signal<ClosedInterval>,
) => useComputed(() => getDuration(activity, filter.value));

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

export const useActivitiesOrderKey = (
  filter: Signal<ClosedInterval>,
  orderBy: Signal<OrderBy>,
) =>
  useComputed(() =>
    // Should be joined by a character which is not used in any ID.
    // Collapsed activities are used to create the key as well to disable flip animation on expand/collapse,
    // which doesn't look nice.
    getActivityIDsByOrder(rootActivity, filter.value, orderBy.value).join("$"),
  );

export const useActivityPath = (
  activity: Signal<Activity>,
  ancestor: Signal<Activity | null> = defaultActivityPathAncestor,
) =>
  useComputed(() => {
    const finalAncestor = ancestor?.value ?? rootActivity.value;
    const ancestorFullname = activityFullNames.value.get(finalAncestor.id)!;
    const activityFullname = activityFullNames.value.get(activity.value.id)!;
    const separatorLength =
      finalAncestor !== rootActivity.value
        ? ACTIVITY_FULL_NAME_SEPARATOR.length
        : 0;
    return activityFullname.substring(
      ancestorFullname.length + separatorLength,
    );
  });

const defaultActivityPathAncestor = signal(null);

export const useActivityID = (activity: Signal<Activity>) =>
  useComputed(() => activity.value.id);

export const useChildrenCount = (
  activity: Signal<Activity>,
  filter: Signal<ClosedInterval>,
) => computed(() => getChildActivities(activity, filter.value).length);

export const parentActivities = computed(() =>
  [...nonRootActivities.value.values()].filter(
    (activity) => activity.value.childIDs.value.length > 0,
  ),
);

export const anyActivityLogged = computed(() => activities.value.size > 1);
