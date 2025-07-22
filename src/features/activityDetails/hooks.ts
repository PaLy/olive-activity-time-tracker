import { Activity } from "../../db/entities";
import { useMemo } from "react";
import { ACTIVITY_FULL_NAME_SEPARATOR } from "../activities/constants";

export const useActivityFullName = (
  activityId: number,
  activities: Map<number, Activity>,
  fromActivityId: number = -1,
) => {
  return useMemo(() => {
    const activity = activities.get(activityId);
    if (!activity) {
      return "";
    }
    const ancestors = [];
    let currentActivity: Activity | undefined = activity;
    while (currentActivity && currentActivity.id !== fromActivityId) {
      ancestors.unshift(currentActivity.name);
      currentActivity = activities.get(currentActivity.parentId);
    }
    return ancestors.join(ACTIVITY_FULL_NAME_SEPARATOR);
  }, [activities, activityId, fromActivityId]);
};
