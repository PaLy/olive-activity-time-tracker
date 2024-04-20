import { Activity } from "./Storage";
import { getIntervalsDuration, getLastEndTime } from "../interval/Algorithms";
import { ClosedInterval } from "../interval/ClosedInterval";
import { chain } from "lodash";

export const isSelfInProgress = (activity: Activity) => {
  return activity.intervals.some((interval) => !interval.end);
};

export const getDescendants = (
  activity: Activity,
  activities: Map<string, Activity>,
): Activity[] =>
  activity.childIDs
    .map((childID) => {
      const child = activities.get(childID);
      if (!child) throw new Error(`Child with ID ${childID} not found`);
      return child;
    })
    .flatMap((child) => [child, ...getDescendants(child, activities)]) ?? [];

export const getNonRootAncestors = (
  activity: Activity,
  activities: Map<string, Activity>,
): Activity[] => getAncestors(activity, activities).slice(0, -1);

const getAncestors = (
  activity: Activity,
  activities: Map<string, Activity>,
): Activity[] => {
  const parent = activities.get(activity.parentID);
  if (!parent) throw new Error(`Parent with ID ${activity.parentID} not found`);
  return parent.id === "root"
    ? [parent]
    : [parent, ...getAncestors(parent, activities)];
};

export const activityFullName = (
  activity: Activity,
  activities: Map<string, Activity>,
) =>
  getNonRootAncestors(activity, activities)
    .reverse()
    .concat(activity)
    .map((activity) => activity.name)
    .join(ACTIVITY_FULL_NAME_SEPARATOR);

export const ACTIVITY_FULL_NAME_SEPARATOR = " / ";

export const getDuration = (
  activity: Activity,
  filter: ClosedInterval,
  activities: Map<string, Activity>,
) => {
  const allIntervals = getAllIntervals(activity, activities);
  return getIntervalsDuration(allIntervals, filter);
};

const getAllIntervals = (
  activity: Activity,
  activities: Map<string, Activity>,
) =>
  [activity, ...getDescendants(activity, activities)].flatMap(
    (activity) => activity.intervals,
  );

const getChildActivitiesByDuration = (
  activity: Activity,
  filter: ClosedInterval,
  activities: Map<string, Activity>,
) =>
  chain(activity.childIDs)
    .map((childID) => activities.get(childID)!)
    .map((child) => ({
      child,
      duration: getDuration(child, filter, activities),
    }))
    .filter(({ duration }) => duration > 0)
    .orderBy(
      [({ duration }) => duration, ({ child }) => child.name],
      ["desc", "asc"],
    )
    .map(({ child }) => child)
    .value();

const getChildActivitiesByLastEndTime = (
  activity: Activity,
  filter: ClosedInterval,
  activities: Map<string, Activity>,
) =>
  chain(activity.childIDs)
    .map((childID) => activities.get(childID)!)
    .map((child) => ({
      child,
      lastEndTime: getLastEndTime(getAllIntervals(child, activities), filter),
    }))
    .filter(({ lastEndTime }) => lastEndTime !== undefined)
    .orderBy(
      [({ lastEndTime }) => lastEndTime, ({ child }) => child.name],
      ["desc", "asc"],
    )
    .map(({ child }) => child)
    .value();

export enum OrderBy {
  Duration,
  LastEndTime,
}

export const getChildActivitiesByOrder = (
  activity: Activity,
  filter: ClosedInterval,
  orderBy: OrderBy,
  activities: Map<string, Activity>,
) => {
  switch (orderBy) {
    case OrderBy.Duration:
      return getChildActivitiesByDuration(activity, filter, activities);
    case OrderBy.LastEndTime:
      return getChildActivitiesByLastEndTime(activity, filter, activities);
  }
};

export const getChildActivities = (
  activity: Activity,
  filter: ClosedInterval,
  activities: Map<string, Activity>,
) =>
  chain(activity.childIDs)
    .map((childID) => activities.get(childID)!)
    .map((child) => ({
      child,
      duration: getDuration(child, filter, activities),
    }))
    .filter(({ duration }) => duration > 0)
    .map(({ child }) => child)
    .value();

const getActivitiesByOrderRec = (
  activity: Activity,
  filter: ClosedInterval,
  expanded: Set<string>,
  orderBy: OrderBy,
  activities: Map<string, Activity>,
): Activity[] => {
  return getChildActivitiesByOrder(
    activity,
    filter,
    orderBy,
    activities,
  ).flatMap((child) => {
    if (expanded.has(child.id)) {
      return [child].concat(
        getActivitiesByOrderRec(child, filter, expanded, orderBy, activities),
      );
    } else {
      return [child];
    }
  });
};

export const getActivitiesByOrder = (
  filter: ClosedInterval,
  expanded: Set<string>,
  orderBy: OrderBy,
  activities: Map<string, Activity>,
): Activity[] => {
  const rootActivity = activities.get("root");
  return rootActivity
    ? getActivitiesByOrderRec(
        rootActivity,
        filter,
        expanded,
        orderBy,
        activities,
      )
    : [];
};

const getActivityIDsByOrderRec = (
  activity: Activity,
  filter: ClosedInterval,
  orderBy: OrderBy,
  expandedAll: Set<string>,
  activities: Map<string, Activity>,
): string[] =>
  expandedAll.has(activity.id)
    ? [activity.id].concat(
        getChildActivitiesByOrder(
          activity,
          filter,
          orderBy,
          activities,
        ).flatMap((child) =>
          getActivityIDsByOrderRec(
            child,
            filter,
            orderBy,
            expandedAll,
            activities,
          ),
        ),
      )
    : [activity.id];

export const getActivityIDsByOrder = (
  filter: ClosedInterval,
  orderBy: OrderBy,
  expandedAll: Set<string>,
  activities: Map<string, Activity>,
): string[] => {
  const rootActivity = activities.get("root");
  return rootActivity
    ? getActivityIDsByOrderRec(
        rootActivity,
        filter,
        orderBy,
        expandedAll,
        activities,
      )
    : [];
};

export const getActivityByInterval = (
  intervalID: string,
  activities: Map<string, Activity>,
) =>
  [...activities.values()].find((activity) =>
    activity.intervals.find(({ id }) => id === intervalID),
  );
