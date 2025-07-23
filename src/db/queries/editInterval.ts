import { db } from "../db";
import { getFullName } from "./activities";
import { Interval } from "../entities";

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
): Promise<void> {
  return db.transaction("rw", db.intervals, async () => {
    // Validate the new start and end times
    if (newStart >= newEnd) {
      throw new Error("Start time must be less than end time.");
    }

    const updated = await db.intervals.update(intervalId, {
      start: newStart,
      end: newEnd,
    });
    if (!updated) {
      throw new Error(`Interval with ID ${intervalId} does not exist.`);
    }
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
