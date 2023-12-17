import { Activity } from "./Storage";
import { intervals } from "../interval/Signals";
import { activities, rootActivity } from "./Signals";
import { getIntervalsDuration } from "../interval/Algorithms";
import { ClosedInterval } from "../interval/ClosedInterval";
import { chain } from "lodash";

export const isSelfInProgress = (activity: Activity) => {
  const { intervalIDs } = activity;
  const lastIntervalId = intervalIDs.value.slice(-1)[0];
  return !!lastIntervalId && !intervals.value.get(lastIntervalId)!.end.value;
};

export const getDescendants = (activity: Activity): Activity[] =>
  activity.childIDs.value
    .map((childID) => activities.value.get(childID)!)
    .flatMap((child) => [child, ...getDescendants(child)]) ?? [];

export const getNonRootAncestors = (activity: Activity): Activity[] =>
  getAncestors(activity).slice(0, -1);

const getAncestors = (activity: Activity): Activity[] => {
  const parent = activities.value.get(activity.parentID.value)!;
  return parent === rootActivity.value
    ? [rootActivity.value]
    : [parent, ...getAncestors(parent)];
};

export const activityFullName = (activity: Activity) =>
  getNonRootAncestors(activity)
    .reverse()
    .concat(activity)
    .map((activity) => activity.name.value)
    .join(" / ");

export const getOwnIntervals = (activity: Activity) =>
  activity.intervalIDs.value.map((id) => intervals.value.get(id)!);

export const getDuration = (activity: Activity, filter: ClosedInterval) => {
  const allIntervalIds = getAllIntervalIds(activity);
  return getIntervalsDuration(allIntervalIds, filter);
};

const getAllIntervalIds = (activity: Activity) =>
  [activity, ...getDescendants(activity)].flatMap(
    (activity) => activity.intervalIDs.value,
  );

export const getChildActivitiesByDuration = (
  activity: Activity,
  filter: ClosedInterval,
) =>
  chain(activity.childIDs.value)
    .map((childID) => activities.value.get(childID)!)
    .map((child) => [child, getDuration(child, filter)] as const)
    .filter(([, duration]) => duration > 0)
    .sortBy(([, duration]) => duration)
    .reverse()
    .map(([child]) => child)
    .value();

export const getSubtreeActivityIDsByDuration = (
  subtreeRoot: Activity,
  filter: ClosedInterval,
): string[] =>
  [subtreeRoot.id].concat(
    getChildActivitiesByDuration(subtreeRoot, filter).flatMap((child) =>
      getSubtreeActivityIDsByDuration(child, filter),
    ),
  );
