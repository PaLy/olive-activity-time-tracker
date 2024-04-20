import { Signal } from "@preact/signals-react";
import { Activity } from "./Storage";
import {
  ACTIVITY_FULL_NAME_SEPARATOR,
  activityFullName,
  getActivityIDsByOrder,
  getChildActivities,
  getDuration,
  getNonRootAncestors,
  isSelfInProgress,
  OrderBy,
} from "./Algorithms";
import { ClosedInterval } from "../interval/ClosedInterval";
import { useActivities } from "./Operations";
import { useMemo } from "react";
import { produce } from "immer";

export const useNonRootActivities = () => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return useMemo(
    () =>
      produce(activities, (draft) => {
        draft.delete("root");
      }),
    [activities],
  );
};

export const useActivityFullNames = () => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return useMemo(
    () =>
      new Map(
        [...activities.entries()].map(([id, activity]) => [
          id,
          activityFullName(activity, activities),
        ]),
      ),
    [activities],
  );
};

export const useInProgressActivities = () => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return useMemo(
    () =>
      new Set(
        Array.from(activities.values())
          .filter(isSelfInProgress)
          .flatMap((inProgressActivity) => [
            inProgressActivity,
            ...getNonRootAncestors(inProgressActivity, activities),
          ]),
      ),
    [activities],
  );
};

export const useInProgressActivitiesCount = () =>
  useInProgressActivities().size;

export const useInProgress = (activity: Activity) =>
  useInProgressActivities().has(activity);

export const useParentActivity = (activity: Activity) => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return activities.get(activity.parentID);
};

export const useDepth = (activity: Activity) => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return useMemo(
    () => getNonRootAncestors(activity, activities).length,
    [activities, activity],
  );
};

export const useDuration = (
  activity: Activity | undefined,
  filter: Signal<ClosedInterval>,
) => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return useMemo(
    () => (activity ? getDuration(activity, filter.value, activities) : 0),
    [activities, activity, filter.value],
  );
};

export const useDurationPercentage = (
  activity: Activity,
  filter: Signal<ClosedInterval>,
) => {
  const parentActivity = useParentActivity(activity);
  const activityDuration = useDuration(activity, filter);
  const parentDuration = useDuration(parentActivity, filter);
  return Math.round((activityDuration / parentDuration) * 100);
};

export const useActivitiesOrderKey = (
  filter: Signal<ClosedInterval>,
  orderBy: Signal<OrderBy>,
  expandedAll: Set<string>,
) => {
  const { data: activities = new Map<string, Activity>() } = useActivities();

  return useMemo(
    () =>
      // Should be joined by a character which is not used in any ID.
      getActivityIDsByOrder(
        filter.value,
        orderBy.value,
        expandedAll,
        activities,
      ).join("$"),
    [activities, expandedAll, filter.value, orderBy.value],
  );
};

export const useActivityPath = (activity: Activity, ancestor?: Activity) => {
  const activityFullNames = useActivityFullNames();

  return useMemo(() => {
    const finalAncestorID = ancestor?.id ?? "root";
    const ancestorFullname = activityFullNames.get(finalAncestorID) ?? "";
    const activityFullname =
      activityFullNames.get(activity.id) ?? activity.name;
    const separatorLength =
      finalAncestorID !== "root" ? ACTIVITY_FULL_NAME_SEPARATOR.length : 0;
    return activityFullname.substring(
      ancestorFullname.length + separatorLength,
    );
  }, [activity, activityFullNames, ancestor]);
};

export const useChildrenCount = (
  activity: Activity,
  filter: Signal<ClosedInterval>,
) => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return useMemo(
    () => getChildActivities(activity, filter.value, activities).length,
    [activities, activity, filter.value],
  );
};

export const useParentActivities = () => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return useMemo(
    () =>
      [...activities.values()].filter(
        (activity) => activity.childIDs.length > 0,
      ),
    [activities],
  );
};

export const useAnyActivityLogged = () => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  return activities.size > 1;
};
