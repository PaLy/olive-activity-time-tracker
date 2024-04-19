import { Activity } from "./Storage";
import { intervals } from "../interval/Signals";
import { activities, rootActivity } from "./Signals";
import { getIntervalsDuration, getLastEndTime } from "../interval/Algorithms";
import { ClosedInterval } from "../interval/ClosedInterval";
import { chain } from "lodash";
import { Signal } from "@preact/signals-react";

export const isSelfInProgress = (activity: Activity) => {
  const { intervalIDs } = activity;
  return intervalIDs.some(
    (intervalID) => !intervals.value.get(intervalID)!.value.end,
  );
};

export const getDescendants = (
  activity: Signal<Activity>,
): Signal<Activity>[] =>
  activity.value.childIDs
    .map((childID) => activities.value.get(childID)!)
    .flatMap((child) => [child, ...getDescendants(child)]) ?? [];

export const getNonRootAncestors = (activity: Activity): Signal<Activity>[] =>
  getAncestors(activity).slice(0, -1);

const getAncestors = (activity: Activity): Signal<Activity>[] => {
  const parent = activities.value.get(activity.parentID)!;
  return parent.value === rootActivity.value
    ? [rootActivity]
    : [parent, ...getAncestors(parent.value)];
};

export const activityFullName = (activity: Signal<Activity>) =>
  getNonRootAncestors(activity.value)
    .reverse()
    .concat(activity)
    .map((activity) => activity.value.name)
    .join(ACTIVITY_FULL_NAME_SEPARATOR);

export const ACTIVITY_FULL_NAME_SEPARATOR = " / ";

export const getOwnIntervals = (activity: Activity) =>
  activity.intervalIDs.map((id) => intervals.value.get(id)!);

export const getDuration = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
) => {
  const allIntervalIds = getAllIntervalIds(activity);
  return getIntervalsDuration(allIntervalIds, filter);
};

const getAllIntervalIds = (activity: Signal<Activity>) =>
  [activity, ...getDescendants(activity)].flatMap(
    (activity) => activity.value.intervalIDs,
  );

const getChildActivitiesByDuration = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
) =>
  chain(activity.value.childIDs)
    .map((childID) => activities.value.get(childID)!)
    .map((child) => ({ child, duration: getDuration(child, filter) }))
    .filter(({ duration }) => duration > 0)
    .orderBy(
      [({ duration }) => duration, ({ child }) => child.value.name],
      ["desc", "asc"],
    )
    .map(({ child }) => child)
    .value();

const getChildActivitiesByLastEndTime = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
) =>
  chain(activity.value.childIDs)
    .map((childID) => activities.value.get(childID)!)
    .map((child) => ({
      child,
      lastEndTime: getLastEndTime(getAllIntervalIds(child), filter),
    }))
    .filter(({ lastEndTime }) => lastEndTime !== undefined)
    .orderBy(
      [({ lastEndTime }) => lastEndTime, ({ child }) => child.value.name],
      ["desc", "asc"],
    )
    .map(({ child }) => child)
    .value();

export enum OrderBy {
  Duration,
  LastEndTime,
}

export const getChildActivitiesByOrder = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
  orderBy: OrderBy,
) => {
  switch (orderBy) {
    case OrderBy.Duration:
      return getChildActivitiesByDuration(activity, filter);
    case OrderBy.LastEndTime:
      return getChildActivitiesByLastEndTime(activity, filter);
  }
};

export const getChildActivities = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
) =>
  chain(activity.value.childIDs)
    .map((childID) => activities.value.get(childID)!)
    .map((child) => ({ child, duration: getDuration(child, filter) }))
    .filter(({ duration }) => duration > 0)
    .map(({ child }) => child)
    .value();

export const getActivitiesByOrder = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
  expanded: Set<string>,
  orderBy: Signal<OrderBy>,
): Signal<Activity>[] => {
  return getChildActivitiesByOrder(activity, filter, orderBy.value).flatMap(
    (child) => {
      if (expanded.has(child.value.id)) {
        return [child].concat(
          getActivitiesByOrder(child, filter, expanded, orderBy),
        );
      } else {
        return [child];
      }
    },
  );
};

export const getActivityIDsByOrder = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
  orderBy: OrderBy,
  expandedAll: Signal<Set<string>>,
): string[] =>
  expandedAll.value.has(activity.value.id)
    ? [activity.value.id].concat(
        getChildActivitiesByOrder(activity, filter, orderBy).flatMap((child) =>
          getActivityIDsByOrder(child, filter, orderBy, expandedAll),
        ),
      )
    : [activity.value.id];

export const getActivityByInterval = (intervalID: string) =>
  [...activities.value.values()].find((activity) =>
    activity.value.intervalIDs.find((id) => id === intervalID),
  );
