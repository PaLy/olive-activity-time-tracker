import { db } from "../db";
import { Activity, Interval } from "../entities";
import { getAncestors, getDescendants } from "./activities";

export type ActivityDetailsData = {
  id: number;
  // include self and ancestors and descendants activities names
  activities: Map<number, Activity>;
  /**
   * Intervals grouped by day when they started.
   * Sorted from the latest to the earliest day.
   * Includes self and descendants activities intervals.
   */
  intervalsByDay: IntervalsByDay;
};

type IntervalsByDay = Array<{
  dayStart: number;
  intervals: Array<Interval>;
}>;

export async function getActivityDetails(
  activityId: number,
): Promise<ActivityDetailsData> {
  const { activity, ancestors, descendants, intervals } = await db.transaction(
    "r",
    db.activities,
    db.intervals,
    async () => {
      const activity = await db.activities.get(activityId);
      if (!activity) {
        throw new Error(`Activity with ID ${activityId} does not exist.`);
      }

      const ancestors = await getAncestors(activity);
      const descendants = await getDescendants(activity);

      const selfAndDescendantsIds = [
        activity.id,
        ...descendants.map((d) => d.id),
      ];

      const intervals = await db.intervals
        .where("activityId")
        .anyOf(selfAndDescendantsIds)
        .toArray();

      return { activity, ancestors, descendants, intervals };
    },
  );

  const activities = new Map<number, Activity>();
  activities.set(activity.id, activity);
  ancestors.concat(descendants).forEach((a) => {
    activities.set(a.id, a);
  });

  const intervalsByDay: IntervalsByDay = [];
  const intervalsByDayMap = new Map<number, Array<Interval>>();
  intervals.forEach((interval) => {
    const dayStart = new Date(interval.start).setHours(0, 0, 0, 0);
    if (!intervalsByDayMap.has(dayStart)) {
      intervalsByDayMap.set(dayStart, []);
      intervalsByDay.push({
        dayStart,
        intervals: intervalsByDayMap.get(dayStart)!,
      });
    }
    intervalsByDayMap.get(dayStart)?.push(interval);
  });
  intervalsByDay.sort((a, b) => b.dayStart - a.dayStart);
  intervalsByDay.forEach((day) => {
    day.intervals.sort((a, b) => b.start - a.start);
  });

  return { id: activityId, activities, intervalsByDay };
}
