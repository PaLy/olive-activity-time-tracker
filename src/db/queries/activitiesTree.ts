import { db } from "../db";
import { Activity, Interval } from "../entities";
import { getAncestorsById } from "./activities";
import { MAX_DATE_MS } from "../../utils/Date";

export type ActivityTreeNode = {
  id: number;
  name: string;
  parent?: ActivityTreeNode; // Undefined parent for the root node
  expanded: boolean;
  children: ActivityTreeNode[];
  subtreeLastEndTime: number;
  subtreeDuration: number;
  subtreeDurationComputedAt: number;
};

type ClosedInterval = {
  start: number;
  end: number;
};

export async function getActivitiesTree(
  intervalFilter: ClosedInterval,
): Promise<ActivityTreeNode> {
  const { activities, intervals } = await loadActivities(intervalFilter);

  const childrenByParentId = getChildrenByParentId(activities);
  const intervalsByActivityId = getIntervalsByActivityId(intervals);

  return activitiesTreeFrom(
    { id: -1, name: "root", parentId: -1, expanded: 1 },
    childrenByParentId,
    intervalsByActivityId,
    intervalFilter,
  );
}

async function loadActivities(intervalFilter: ClosedInterval) {
  const { activities, intervals } = await db.transaction(
    "r",
    db.intervals,
    db.activities,
    async () => {
      const intervals = await getIntervals(intervalFilter);
      const activityIds = await getActivityIds(intervals);
      const activities = await getActivitiesByIds(activityIds);
      return { activities, intervals };
    },
  );
  return { activities, intervals };
}

function getIntervalsByActivityId(intervals: Array<Interval>) {
  const intervalsByActivityId = new Map<number, Array<Interval>>();
  intervals.forEach((interval) => {
    if (!intervalsByActivityId.has(interval.activityId)) {
      intervalsByActivityId.set(interval.activityId, []);
    }
    intervalsByActivityId.get(interval.activityId)?.push(interval);
  });
  return intervalsByActivityId;
}

function getChildrenByParentId(activities: Array<Activity>) {
  const childrenByParentId = new Map<number, Array<Activity>>();
  activities.forEach((activity) => {
    if (!childrenByParentId.has(activity.parentId)) {
      childrenByParentId.set(activity.parentId, []);
    }
    childrenByParentId.get(activity.parentId)?.push(activity);
  });
  return childrenByParentId;
}

function activitiesTreeFrom(
  parent: Pick<Activity, "id" | "name" | "parentId" | "expanded">,
  childrenByParentId: Map<number, Array<Activity>>,
  intervalsByActivityId: Map<number, Array<Interval>>,
  intervalFilter: ClosedInterval,
): ActivityTreeNode {
  const children = childrenByParentId.get(parent.id) ?? [];

  const parentIntervals = intervalsByActivityId.get(parent.id) ?? [];
  const descendantsIntervals = getDescendantsIntervals(
    parent.id,
    childrenByParentId,
    intervalsByActivityId,
  );
  const intervals = [...parentIntervals, ...descendantsIntervals];

  const subtreeDurationComputedAt = new Date().getTime();
  const subtreeDuration = getDuration(
    intervals,
    subtreeDurationComputedAt,
    intervalFilter,
  );

  const subtreeLastEndTime = Math.max(
    ...intervals.map((interval) => interval.end),
    0,
  );

  const childNodes = children.map((child) =>
    activitiesTreeFrom(
      child,
      childrenByParentId,
      intervalsByActivityId,
      intervalFilter,
    ),
  );

  // parent of parentNode will be set by the caller
  const parentNode: ActivityTreeNode = {
    id: parent.id,
    name: parent.name,
    expanded: !!parent.expanded,
    children: childNodes,
    subtreeDuration,
    subtreeDurationComputedAt: new Date().getTime(),
    subtreeLastEndTime,
  };

  childNodes.forEach((child) => {
    child.parent = parentNode;
  });

  return parentNode;
}

function getDescendantsIntervals(
  activityId: number,
  childrenByParentId: Map<number, Array<Activity>>,
  intervalsByActivityId: Map<number, Array<Interval>>,
) {
  const descendants: Array<Interval> = [];
  const children = childrenByParentId.get(activityId) ?? [];
  for (const child of children) {
    descendants.push(...(intervalsByActivityId.get(child.id) ?? []));
    descendants.push(
      ...getDescendantsIntervals(
        child.id,
        childrenByParentId,
        intervalsByActivityId,
      ),
    );
  }
  return descendants;
}

/**
 * Calculates the total duration of the given intervals.
 * Overlapping intervals are merged.
 * Only the duration within the specified intervalFilter is counted.
 * If an ongoing interval (its end is MAX_DATE_MS) is present, its duration is counted only up to ongoingIntervalEnd.
 */
function getDuration(
  intervals: Interval[],
  ongoingIntervalEnd: number,
  intervalFilter: ClosedInterval,
): number {
  if (intervals.length === 0) {
    return 0;
  }

  // Sort intervals by start time
  intervals.sort((a, b) => a.start - b.start);

  let totalDuration = 0;
  let currentStart = intervalFilter.start;

  for (const interval of intervals) {
    const start = Math.max(interval.start, currentStart);
    const end =
      interval.end === MAX_DATE_MS ? ongoingIntervalEnd : interval.end;

    if (end <= currentStart || start >= intervalFilter.end) {
      continue; // Skip intervals that are outside the filter range
    }

    const effectiveEnd = Math.min(end, intervalFilter.end);
    if (effectiveEnd > start) {
      totalDuration += effectiveEnd - start;
      currentStart = effectiveEnd; // Move the current start to the end of this interval
    }
  }

  return totalDuration;
}

async function getIntervals(intervalFilter: ClosedInterval) {
  return db.intervals
    .where("end")
    .aboveOrEqual(intervalFilter.start)
    .and((interval) => interval.start < intervalFilter.end)
    .toArray();
}

async function getActivityIds(intervals: Array<Interval>) {
  const activityIds = new Set(intervals.map((interval) => interval.activityId));
  await Promise.all(
    activityIds.values().map(async (activityId) => {
      // Include ancestors of the activity
      const ancestors = await getAncestorsById(activityId);
      ancestors.forEach((ancestor) => {
        activityIds.add(ancestor.id);
      });
    }),
  );
  return activityIds;
}

async function getActivitiesByIds(ids: Set<number>) {
  return db.activities.where("id").anyOf(Array.from(ids)).toArray();
}
