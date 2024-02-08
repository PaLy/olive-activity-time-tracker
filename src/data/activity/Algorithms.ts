import { Activity } from "./Storage";
import { intervals } from "../interval/Signals";
import { activities, rootActivity } from "./Signals";
import { getIntervalsDuration } from "../interval/Algorithms";
import { ClosedInterval } from "../interval/ClosedInterval";
import { chain } from "lodash";
import { Signal } from "@preact/signals-react";

export const isSelfInProgress = (activity: Signal<Activity>) => {
  const { intervalIDs } = activity.value;
  return intervalIDs.value.some(
    (intervalID) => !intervals.value.get(intervalID)!.value.end.value,
  );
};

export const getDescendants = (
  activity: Signal<Activity>,
): Signal<Activity>[] =>
  activity.value.childIDs.value
    .map((childID) => activities.value.get(childID)!)
    .flatMap((child) => [child, ...getDescendants(child)]) ?? [];

export const getNonRootAncestors = (
  activity: Signal<Activity>,
): Signal<Activity>[] => getAncestors(activity).slice(0, -1);

const getAncestors = (activity: Signal<Activity>): Signal<Activity>[] => {
  const parent = activities.value.get(activity.value.parentID.value)!;
  return parent.value === rootActivity.value
    ? [rootActivity]
    : [parent, ...getAncestors(parent)];
};

export const activityFullName = (activity: Signal<Activity>) =>
  getNonRootAncestors(activity)
    .reverse()
    .concat(activity)
    .map((activity) => activity.value.name.value)
    .join(ACTIVITY_FULL_NAME_SEPARATOR);

export const ACTIVITY_FULL_NAME_SEPARATOR = " / ";

export const getOwnIntervals = (activity: Signal<Activity>) =>
  activity.value.intervalIDs.value.map((id) => intervals.value.get(id)!);

export const getDuration = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
) => {
  const allIntervalIds = getAllIntervalIds(activity);
  return getIntervalsDuration(allIntervalIds, filter);
};

const getAllIntervalIds = (activity: Signal<Activity>) =>
  [activity, ...getDescendants(activity)].flatMap(
    (activity) => activity.value.intervalIDs.value,
  );

export const getChildActivitiesByDuration = (
  activity: Signal<Activity>,
  filter: ClosedInterval,
) =>
  chain(activity.value.childIDs.value)
    .map((childID) => activities.value.get(childID)!)
    .map((child) => ({ child, duration: getDuration(child, filter) }))
    .filter(({ duration }) => duration > 0)
    .orderBy(
      [({ duration }) => duration, ({ child }) => child.value.name.value],
      ["desc", "asc"],
    )
    .map(({ child }) => child)
    .value();

export const getSubtreeActivityIDsByDuration = (
  subtreeRoot: Signal<Activity>,
  filter: ClosedInterval,
): string[] =>
  [subtreeRoot.value.id].concat(
    getChildActivitiesByDuration(subtreeRoot, filter).flatMap((child) =>
      getSubtreeActivityIDsByDuration(child, filter),
    ),
  );

export const getActivityByInterval = (intervalID: string) =>
  [...activities.value.values()].find((activity) =>
    activity.value.intervalIDs.value.find((id) => id === intervalID),
  );
