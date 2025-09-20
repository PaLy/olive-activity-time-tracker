import { ACTIVITY_FULL_NAME_SEPARATOR } from "./constants";
import { ActivityTreeNode } from "../../db/queries/activitiesTree";
import { MAX_DATE_MS } from "../../utils/date";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { useState } from "react";
import { resumeActivity } from "../../db/queries/resumeActivity";
import { stopActivity } from "../../db/queries/stopActivity";
import { useClockStore } from "../../utils/clock";
import { SimpleInterval } from "../../utils/types";

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

export const useIsInProgressInInterval = (
  activity: ActivityTreeNode,
  interval: SimpleInterval,
) => {
  const time = useClockStore((state) => state.time);
  return activity.subtreeLastEndTime === MAX_DATE_MS && +time < interval.end;
};

export const depth = (activity: ActivityTreeNode): number => {
  if (!activity.parent || activity.parent.id === -1) {
    return 0;
  } else {
    return 1 + depth(activity.parent);
  }
};

export function activityDuration(
  a: ActivityTreeNode,
  interval: SimpleInterval,
  time: number,
) {
  if (a.subtreeLastEndTime === MAX_DATE_MS) {
    const inProgressInInterval = time < interval.end;
    if (inProgressInInterval) {
      return a.subtreeDuration + (time - a.subtreeDurationComputedAt);
    } else {
      const endTime = Math.min(time, interval.end);
      if (endTime > a.subtreeDurationComputedAt) {
        return a.subtreeDuration + (endTime - a.subtreeDurationComputedAt);
      } else {
        return a.subtreeDuration;
      }
    }
  } else {
    return a.subtreeDuration;
  }
}

export const useDuration = (
  activity: ActivityTreeNode | undefined,
  interval: SimpleInterval,
) => {
  const time = useClockStore((state) => state.time);
  if (!activity) {
    return 0;
  }
  return activityDuration(activity, interval, +time);
};

export const useDurationPercentage = (
  activity: ActivityTreeNode,
  interval: SimpleInterval,
) => {
  const parentActivity = activity.parent;
  const activityDuration = useDuration(activity, interval);
  const parentDuration = useDuration(parentActivity, interval);
  return Math.round((activityDuration / parentDuration) * 100);
};

export const useStartActivity = () => {
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const [isPending, setIsPending] = useState(false);
  return {
    mutate: async (variables: { activity: ActivityTreeNode }) => {
      const { activity } = variables;
      setIsPending(true);
      try {
        await resumeActivity({
          activityId: activity.id,
          startTime: new Date().getTime(),
        });
      } catch (error) {
        console.error(error);
        openErrorSnackbar(`Failed to start activity`);
      } finally {
        setIsPending(false);
      }
    },
    isPending,
  };
};

export const useStopActivity = () => {
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const [isPending, setIsPending] = useState(false);
  return {
    mutate: async (variables: { activity: ActivityTreeNode }) => {
      const { activity } = variables;
      setIsPending(true);
      try {
        await stopActivity({
          activityId: activity.id,
          end: new Date().getTime(),
        });
      } catch (error) {
        console.error(error);
        openErrorSnackbar(`Failed to stop activity`);
      } finally {
        setIsPending(false);
      }
    },
    isPending,
  };
};
