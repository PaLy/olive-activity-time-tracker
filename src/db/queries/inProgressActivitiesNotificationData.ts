import { db } from "../db";
import { getInProgressIntervals } from "./intervals";
import { getActivity, getFullName } from "./activities";

export type InProgressActivitiesNotificationData = Array<{
  fullName: string;
  start: number;
}>;

export async function getInProgressActivitiesNotificationData(): Promise<InProgressActivitiesNotificationData> {
  return db.transaction("r", db.activities, db.intervals, async () => {
    const intervals = await getInProgressIntervals().sortBy("start");

    return Promise.all(
      intervals.map(async (interval) => {
        const activity = await getActivity(interval.activityId);
        const fullName = await getFullName(activity);
        return { fullName, start: interval.start };
      }),
    );
  });
}
