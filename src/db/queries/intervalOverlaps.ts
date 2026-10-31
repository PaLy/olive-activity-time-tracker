import { db } from "../db";
import { MAX_DATE_MS } from "../../utils/date";
import { Activity, Interval } from "../entities";

export type TimeRange = { start: number; end: number };

export type IntervalChange = {
  // undefined for the interval being added or edited
  intervalId?: number;
  activityId: number;
  activityFullName: string;
  // true for the interval being added or edited
  isModified: boolean;
  before: TimeRange | undefined;
  // empty when the interval is removed entirely
  after: TimeRange[];
  // true for own intervals concatenated into the modified interval
  merged?: boolean;
  // existing intervals of the same activity or descendants that overlap the modified interval
  overlapping?: { activityFullName: string; range: TimeRange }[];
};

export type IntervalPlan = {
  // resulting intervals of the activity: the remaining pieces of the modified
  // interval, concatenated with touching/overlapping own intervals
  pieces: TimeRange[];
  // own intervals merged into the pieces; they must be deleted
  absorbedIds: number[];
  // ancestor interval updates; the id is always set
  ancestorChanges: (IntervalChange & { intervalId: number })[];
  // human readable list of all changes to other intervals plus the modified one if it was cut
  changes: IntervalChange[];
};

type PlanParams = {
  start: number;
  end: number;
  // exactly one of activityId / parentId (for a not yet existing activity)
  activityId?: number;
  parentId?: number;
  // the interval being edited
  excludeIntervalId?: number;
};

const overlaps = (a: TimeRange, b: TimeRange) =>
  a.start < b.end && b.start < a.end;

export function subtractRanges(
  range: TimeRange,
  cuts: TimeRange[],
): TimeRange[] {
  const sorted = [...cuts].sort((a, b) => a.start - b.start);
  const result: TimeRange[] = [];
  let cursor = range.start;
  for (const cut of sorted) {
    if (cut.end <= cursor) continue;
    if (cut.start >= range.end) break;
    if (cut.start > cursor) {
      result.push({ start: cursor, end: cut.start });
    }
    cursor = Math.max(cursor, cut.end);
  }
  if (cursor < range.end) {
    result.push({ start: cursor, end: range.end });
  }
  return result;
}

async function getAncestorChain(activityId: number): Promise<Activity[]> {
  const chain: Activity[] = [];
  let id = activityId;
  while (id !== -1) {
    const a = await db.activities.get(id);
    if (!a) break;
    chain.push(a);
    id = a.parentId;
  }
  return chain;
}

async function getDescendantsOf(activityId: number): Promise<Activity[]> {
  const result: Activity[] = [];
  const queue = [activityId];
  while (queue.length > 0) {
    const children = await db.activities
      .where("parentId")
      .equals(queue.shift()!)
      .toArray();
    result.push(...children);
    queue.push(...children.map((c) => c.id));
  }
  return result;
}

async function fullName(activity: Activity): Promise<string> {
  const chain = await getAncestorChain(activity.id);
  return chain
    .reverse()
    .map((a) => a.name)
    .join(" / ");
}

/**
 * Merges the pieces with own intervals that overlap or touch them.
 * Own intervals not touching any piece are left alone.
 */
function concatenate(
  pieces: TimeRange[],
  own: Interval[],
): { pieces: TimeRange[]; absorbed: Interval[] } {
  const items = [
    ...pieces.map((range) => ({
      range,
      interval: undefined as Interval | undefined,
    })),
    ...own.map((interval) => ({
      range: { start: interval.start, end: interval.end },
      interval,
    })),
  ].sort((a, b) => a.range.start - b.range.start);

  const merged: TimeRange[] = [];
  const absorbed: Interval[] = [];
  let group: typeof items = [];
  let groupEnd = -Infinity;
  const flush = () => {
    if (group.some((item) => !item.interval)) {
      merged.push({
        start: group[0].range.start,
        end: Math.max(...group.map((item) => item.range.end)),
      });
      absorbed.push(...group.flatMap((item) => item.interval ?? []));
    }
    group = [];
  };
  for (const item of items) {
    if (group.length > 0 && item.range.start > groupEnd) flush();
    group.push(item);
    groupEnd = Math.max(groupEnd, item.range.end);
  }
  flush();
  return { pieces: merged, absorbed };
}

/**
 * Computes how other intervals must change so that an interval of the given
 * activity does not overlap its ancestors' or descendants' intervals:
 * ancestor intervals are cut out; the new interval is cut by descendant and
 * same-activity intervals;
 * the remainder is concatenated with touching same-activity intervals.
 * In-progress relatives are ignored when the new interval is in progress,
 * because a running activity implies its ancestors/descendants are running.
 */
export async function planIntervalChanges(
  params: PlanParams,
): Promise<IntervalPlan> {
  const { start, end, activityId, parentId, excludeIntervalId } = params;
  const inProgress = end === MAX_DATE_MS;

  const self =
    activityId !== undefined ? await db.activities.get(activityId) : undefined;
  const ancestors = await getAncestorChain(
    self ? self.parentId : (parentId ?? -1),
  );
  const descendants = self ? await getDescendantsOf(self.id) : [];

  const activitiesById = new Map<number, Activity>(
    [...ancestors, ...descendants].map((a) => [a.id, a]),
  );
  const relativeIntervals = (ids: number[]) =>
    db.intervals
      .where("activityId")
      .anyOf(ids)
      .filter(
        (i) =>
          i.id !== excludeIntervalId && !(inProgress && i.end === MAX_DATE_MS),
      )
      .toArray();

  const descendantIntervals = await relativeIntervals(
    descendants.map((a) => a.id),
  );
  const ownRange = { start, end };
  const ownIntervals =
    self === undefined
      ? []
      : await db.intervals
          .where("activityId")
          .equals(self.id)
          .filter((i) => i.id !== excludeIntervalId)
          .toArray();
  const rawPieces = subtractRanges(
    ownRange,
    [...descendantIntervals, ...ownIntervals].filter((i) =>
      overlaps(i, ownRange),
    ),
  );

  const { pieces, absorbed } = concatenate(rawPieces, ownIntervals);

  const ancestorIntervals = await relativeIntervals(ancestors.map((a) => a.id));
  const ancestorChanges: IntervalPlan["ancestorChanges"] = [];
  for (const interval of ancestorIntervals) {
    if (!rawPieces.some((p) => overlaps(interval, p))) continue;
    ancestorChanges.push({
      intervalId: interval.id,
      activityId: interval.activityId,
      activityFullName: await fullName(
        activitiesById.get(interval.activityId)!,
      ),
      isModified: false,
      before: { start: interval.start, end: interval.end },
      after: subtractRanges(interval, rawPieces),
    });
  }

  const changes: IntervalChange[] = [...ancestorChanges];
  const selfName = self ? await fullName(self) : "";
  for (const interval of absorbed) {
    changes.push({
      intervalId: interval.id,
      activityId: interval.activityId,
      activityFullName: selfName,
      isModified: false,
      merged: true,
      before: { start: interval.start, end: interval.end },
      after: [],
    });
  }
  const changedOwn =
    pieces.length !== 1 || pieces[0].start !== start || pieces[0].end !== end;
  if (changedOwn) {
    const overlapping: NonNullable<IntervalChange["overlapping"]> = [];
    const covering = [...ownIntervals, ...descendantIntervals]
      .filter((i) => overlaps(i, ownRange))
      .sort((a, b) => a.start - b.start);
    for (const i of covering) {
      const activity = activitiesById.get(i.activityId) ?? self;
      overlapping.push({
        activityFullName: activity ? await fullName(activity) : "",
        range: { start: i.start, end: i.end },
      });
    }
    changes.push({
      overlapping,
      activityId: activityId ?? -1,
      activityFullName: selfName,
      isModified: true,
      before: { start, end },
      after: pieces,
    });
  }
  changes.sort(
    (a, b) =>
      (a.before?.start ?? 0) - (b.before?.start ?? 0) ||
      Number(a.isModified) - Number(b.isModified),
  );

  return {
    pieces,
    absorbedIds: absorbed.map((i) => i.id),
    ancestorChanges,
    changes,
  };
}

/** Applies ancestor changes: first piece updates the original, the rest are added. */
export async function applyAncestorChanges(
  ancestorChanges: IntervalPlan["ancestorChanges"],
) {
  for (const change of ancestorChanges) {
    const [first, ...rest] = change.after;
    if (!first) {
      await db.intervals.delete(change.intervalId);
      continue;
    }
    await db.intervals.update(change.intervalId, first);
    if (rest.length > 0) {
      await db.intervals.bulkAdd(
        rest.map((r) => ({ activityId: change.activityId, ...r })) as never,
      );
    }
  }
}
