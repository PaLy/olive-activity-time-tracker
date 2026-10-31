import { db } from "../db";
import { getActivity, getFullName } from "./activities";
import { Interval } from "../entities";
import { applyAncestorChanges, planIntervalChanges } from "./intervalOverlaps";

export type EditIntervalData = {
  interval: Interval;
  // concatenation of self and ancestors activity names joined with " / "
  activityFullName: string;
};

export async function getEditIntervalData(
  intervalId: number,
): Promise<EditIntervalData> {
  return db.transaction("r", db.activities, db.intervals, async () => {
    const interval = await db.intervals.get(intervalId);
    if (!interval) {
      throw new Error(`Interval with ID ${intervalId} does not exist.`);
    }

    const activity = await db.activities.get(interval.activityId);
    if (!activity) {
      throw new Error(
        `Activity with ID ${interval.activityId} does not exist.`,
      );
    }

    const activityFullName = await getFullName(activity);

    return { activityFullName, interval };
  });
}

export async function updateInterval(
  intervalId: number,
  newStart: number,
  newEnd: number,
  newActivityId?: number,
): Promise<void> {
  return db.transaction("rw", db.intervals, db.activities, async () => {
    // Validate the new start and end times
    if (newStart >= newEnd) {
      throw new Error("Start time must be less than end time.");
    }

    if (newActivityId !== undefined) {
      await getActivity(newActivityId);
    }

    const existing = await db.intervals.get(intervalId);
    if (!existing) {
      throw new Error(`Interval with ID ${intervalId} does not exist.`);
    }
    const activityId = newActivityId ?? existing.activityId;

    const plan = await planIntervalChanges({
      activityId,
      start: newStart,
      end: newEnd,
      excludeIntervalId: intervalId,
    });
    await applyAncestorChanges(plan.ancestorChanges);
    await db.intervals.bulkDelete(plan.absorbedIds);

    const [first, ...rest] = plan.pieces;
    if (first) {
      await db.intervals.update(intervalId, { ...first, activityId });
      await db.intervals.bulkAdd(
        rest.map((piece) => ({ activityId, ...piece })) as never,
      );
    } else {
      await db.intervals.delete(intervalId);
    }
  });
}

export async function planUpdateInterval(
  intervalId: number,
  newStart: number,
  newEnd: number,
  newActivityId?: number,
) {
  const existing = await db.intervals.get(intervalId);
  if (!existing) {
    throw new Error(`Interval with ID ${intervalId} does not exist.`);
  }
  return planIntervalChanges({
    activityId: newActivityId ?? existing.activityId,
    start: newStart,
    end: newEnd,
    excludeIntervalId: intervalId,
  });
}

export async function deleteInterval(intervalId: number): Promise<void> {
  return db.transaction("rw", db.intervals, async () => {
    const interval = await db.intervals.get(intervalId);
    if (!interval) {
      throw new Error(`Interval with ID ${intervalId} does not exist.`);
    }

    // Delete the interval
    await db.intervals.delete(intervalId);
  });
}
