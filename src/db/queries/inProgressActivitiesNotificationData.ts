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

    const activitiesWithNotifications = await Promise.all(
      intervals.map(async (interval) => {
        const activity = await getActivity(interval.activityId);

        // Skip activities with notifications disabled
        if (!activity.notificationsEnabled) {
          return null;
        }

        const fullName = await getFullName(activity);
        return { fullName, start: interval.start };
      }),
    );

    // Filter out null values (activities with notifications disabled)
    return activitiesWithNotifications.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );
  });
}
