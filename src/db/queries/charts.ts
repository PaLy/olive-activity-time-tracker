import dayjs from "dayjs";
import { db } from "../db";
import { MAX_DATE_MS } from "../../utils/date";
import {
  ActivityOption,
  getActivityOptions,
  ROOT_ACTIVITY_ID,
} from "./activities";
import { ActivityTreeNode, getActivitiesTree } from "./activitiesTree";

export type ActivityDuration = {
  id: number;
  name: string;
  duration: number; // ms, including descendants
};

export type ActivityBreakdown = {
  total: number;
  items: ActivityDuration[]; // direct children plus the activity's own time
};

/**
 * Time spent on an activity (descendants included) split into its direct
 * children and the time tracked on the activity itself.
 */
export async function getActivityBreakdown(
  period: { start: number; end: number },
  activityId: number,
): Promise<ActivityBreakdown> {
  const tree = await getActivitiesTree(period);
  const node = findNode(tree, activityId);
  if (!node) {
    return { total: 0, items: [] };
  }

  const items = node.children.map((child) => ({
    id: child.id,
    name: child.name,
    duration: child.subtreeDuration,
  }));
  // Children rarely overlap each other, so the remainder is the activity's own time.
  const own =
    node.subtreeDuration - items.reduce((sum, item) => sum + item.duration, 0);
  if (own > 0) {
    const name = items.length > 0 ? `${node.name} (itself)` : node.name;
    items.push({ id: node.id, name, duration: own });
  }
  return {
    total: node.subtreeDuration,
    items: items
      .filter((item) => item.duration > 0)
      .sort((a, b) => b.duration - a.duration),
  };
}

function findNode(
  node: ActivityTreeNode,
  id: number,
): ActivityTreeNode | undefined {
  if (node.id === id) {
    return node;
  }
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) {
      return found;
    }
  }
  return undefined;
}

export type BucketDurations = {
  start: number;
  durations: ActivityDuration[];
};

/** Breakdown of an activity for each consecutive period (e.g. each day). */
export async function getTimePerBucket(
  buckets: { start: number; end: number }[],
  activityId: number,
): Promise<BucketDurations[]> {
  return Promise.all(
    buckets.map(async (bucket) => ({
      start: bucket.start,
      durations: (await getActivityBreakdown(bucket, activityId)).items,
    })),
  );
}

async function getSubtreeIds(activityId: number): Promise<Set<number>> {
  const activities = await db.activities.toArray();
  const childrenByParentId = new Map<number, number[]>();
  activities.forEach((activity) => {
    const siblings = childrenByParentId.get(activity.parentId) ?? [];
    siblings.push(activity.id);
    childrenByParentId.set(activity.parentId, siblings);
  });

  const ids = new Set<number>();
  const queue = [activityId];
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (!ids.has(id)) {
      ids.add(id);
      queue.push(...(childrenByParentId.get(id) ?? []));
    }
  }
  return ids;
}

/**
 * Tracked time (ms) by local weekday (0 = Sunday) and hour of day within the period.
 * Limited to the activity and its descendants, or all activities when activityId is null.
 * Overlapping intervals of different activities are counted once.
 */
export async function getTimeByWeekdayHour(
  period: { start: number; end: number },
  activityId: number | null,
  now = Date.now(),
): Promise<number[][]> {
  const ids = activityId === null ? null : await getSubtreeIds(activityId);
  const intervals = await db.intervals
    .where("end")
    .aboveOrEqual(period.start)
    .and(
      (interval) =>
        interval.start < period.end && (!ids || ids.has(interval.activityId)),
    )
    .toArray();

  const clipped = intervals
    .map((interval) => ({
      start: Math.max(interval.start, period.start),
      end: Math.min(
        interval.end === MAX_DATE_MS ? now : interval.end,
        period.end,
      ),
    }))
    .filter((interval) => interval.end > interval.start)
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const interval of clipped) {
    const last = merged[merged.length - 1];
    if (last && interval.start <= last.end) {
      last.end = Math.max(last.end, interval.end);
    } else {
      merged.push({ ...interval });
    }
  }

  const result = Array.from({ length: 7 }, () => new Array<number>(24).fill(0));
  for (const interval of merged) {
    let slice = dayjs(interval.start).startOf("hour");
    while (slice.valueOf() < interval.end) {
      const next = slice.add(1, "hour");
      const overlap =
        Math.min(next.valueOf(), interval.end) -
        Math.max(slice.valueOf(), interval.start);
      result[slice.day()][slice.hour()] += overlap;
      slice = next;
    }
  }
  return result;
}

/** All activities for charts; the root comes first as "All activities". */
export async function getChartActivityOptions(): Promise<ActivityOption[]> {
  return [
    { id: ROOT_ACTIVITY_ID, fullName: "All activities" },
    ...(await getActivityOptions()),
  ];
}

/** Start time of the earliest interval, or undefined when nothing is tracked. */
export async function getFirstIntervalStart(): Promise<number | undefined> {
  return (await db.intervals.orderBy("start").first())?.start;
}

/**
 * Number of switches in each bucket: times when tracking moved to an activity
 * in the subtree (the activity and all its descendants) from a different
 * activity. Consecutive intervals of the same activity (e.g. stop and resume)
 * are not counted again. Buckets must be consecutive and sorted by time.
 */
export async function getSwitchCounts(
  activityId: number,
  buckets: { start: number; end: number }[],
): Promise<number[]> {
  const counts = new Array<number>(buckets.length).fill(0);
  if (buckets.length === 0) {
    return counts;
  }
  const ids = await getSubtreeIds(activityId);
  const intervals = await db.intervals
    .where("start")
    .between(buckets[0].start, buckets[buckets.length - 1].end, true, false)
    .toArray();
  // The interval right before the range decides whether the first one is a switch.
  let previousActivityId = (
    await db.intervals.where("start").below(buckets[0].start).last()
  )?.activityId;

  for (const { start, activityId: currentActivityId } of intervals) {
    const isSwitch = currentActivityId !== previousActivityId;
    previousActivityId = currentActivityId;
    if (!isSwitch || !ids.has(currentActivityId)) {
      continue;
    }
    let low = 0;
    let high = buckets.length - 1;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (buckets[mid].start <= start) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }
    counts[low]++;
  }
  return counts;
}

const MINUTE_MS = 60_000;
export const SESSION_BINS = [
  { label: "<15m", max: 15 * MINUTE_MS },
  { label: "15–30m", max: 30 * MINUTE_MS },
  { label: "30–60m", max: 60 * MINUTE_MS },
  { label: "1–2h", max: 120 * MINUTE_MS },
  { label: "2–4h", max: 240 * MINUTE_MS },
  { label: ">4h", max: Infinity },
];

/**
 * Histogram of session lengths for an activity and all its descendants.
 * A session is a continuous stretch of tracked time: overlapping or touching
 * intervals (e.g. switching between child activities) form a single session.
 * Intervals separated by at most maxGapMs are also merged into one session.
 */
export async function getSessionLengthHistogram(
  activityId: number,
  period: { start: number; end: number },
  maxGapMs = 0,
  now = Date.now(),
): Promise<{ label: string; count: number }[]> {
  const ids = await getSubtreeIds(activityId);

  const intervals = await db.intervals
    .where("end")
    .aboveOrEqual(period.start)
    .and(
      (interval) => interval.start < period.end && ids.has(interval.activityId),
    )
    .toArray();

  const clipped = intervals
    .map((interval) => ({
      start: Math.max(interval.start, period.start),
      end: Math.min(
        interval.end === MAX_DATE_MS ? now : interval.end,
        period.end,
      ),
    }))
    .filter((interval) => interval.end > interval.start)
    .sort((a, b) => a.start - b.start);

  const sessions: { start: number; end: number }[] = [];
  for (const interval of clipped) {
    const last = sessions[sessions.length - 1];
    if (last && interval.start <= last.end + maxGapMs) {
      last.end = Math.max(last.end, interval.end);
    } else {
      sessions.push({ ...interval });
    }
  }

  const histogram = SESSION_BINS.map((bin) => ({ label: bin.label, count: 0 }));
  for (const session of sessions) {
    const length = session.end - session.start;
    histogram[SESSION_BINS.findIndex((bin) => length < bin.max)].count++;
  }
  return histogram;
}
