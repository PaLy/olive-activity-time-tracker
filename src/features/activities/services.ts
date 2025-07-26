import { ACTIVITY_FULL_NAME_SEPARATOR } from "./constants";
import { ActivityTreeNode } from "../../db/queries/activitiesTree";
import { MAX_DATE_MS } from "../../utils/date";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { useState } from "react";
import { resumeActivity } from "../../db/queries/resumeActivity";
import { stopActivity } from "../../db/queries/stopActivity";
import { useClockStore } from "../../utils/clock";

export const getNonRootAncestors = <A extends { id: number; parent?: A }>(
  activity: A,
): A[] => getAncestors(activity).slice(0, -1);

/**
 * Recursively gets all ancestors of an activity, including the root.
 * @param activity
 */
const getAncestors = <A extends { id: number; parent?: A }>(
  activity: A,
): A[] => {
  const parent = activity.parent;
  if (!parent) {
    return [];
  }
  return parent.id === -1 ? [parent] : [parent, ...getAncestors(parent)];
};

export const activityFullName = <
  A extends { id: number; name: string; parent?: A },
>(
  activity: A,
) => {
  return getNonRootAncestors(activity)
    .reverse()
    .concat(activity)
    .map((activity) => activity.name)
    .join(ACTIVITY_FULL_NAME_SEPARATOR);
};

export const isInProgressInDateRange = (activity: ActivityTreeNode) =>
  activity.subtreeLastEndTime === MAX_DATE_MS;

export const depth = (activity: ActivityTreeNode): number => {
  if (!activity.parent || activity.parent.id === -1) {
    return 0;
  } else {
    return 1 + depth(activity.parent);
  }
};

export function activityDuration(a: ActivityTreeNode, time: number) {
  if (a.subtreeLastEndTime === MAX_DATE_MS) {
    return a.subtreeDuration + (time - a.subtreeDurationComputedAt);
  } else {
    return a.subtreeDuration;
  }
}

export const useDuration = (activity: ActivityTreeNode | undefined) => {
  const time = useClockStore((state) => state.time);
  if (!activity) {
    return 0;
  }
  return activityDuration(activity, +time);
};

export const useDurationPercentage = (activity: ActivityTreeNode) => {
  const parentActivity = activity.parent;
  const activityDuration = useDuration(activity);
  const parentDuration = useDuration(parentActivity);
  return Math.round((activityDuration / parentDuration) * 100);
};

export const useStartActivity = () => {
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const [isPending, setIsPending] = useState(false);
  return {
    mutate: (variables: { activity: ActivityTreeNode }) => {
      const { activity } = variables;
      setIsPending(true);
      resumeActivity({
        activityId: activity.id,
        startTime: new Date().getTime(),
      })
        .finally(() => setIsPending(false))
        .catch((error) => {
          console.error(error);
          openErrorSnackbar(`Failed to start activity`);
        });
    },
    isPending,
  };
};

export const useStopActivity = () => {
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const [isPending, setIsPending] = useState(false);
  return {
    mutate: (variables: { activity: ActivityTreeNode }) => {
      const { activity } = variables;
      setIsPending(true);
      stopActivity({
        activityId: activity.id,
        end: new Date().getTime(),
      })
        .finally(() => setIsPending(false))
        .catch((error) => {
          console.error(error);
          openErrorSnackbar(`Failed to stop activity`);
        });
    },
    isPending,
  };
};
