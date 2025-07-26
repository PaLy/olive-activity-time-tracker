import { getActivity, isInProgress, stopAncestors } from "./activities";
import { MAX_DATE_MS } from "../../utils/date";
import { db } from "../db";

type ResumeActivityParams = {
  activityId: number;
  startTime: number;
};

export async function resumeActivity(params: ResumeActivityParams) {
  const { activityId, startTime } = params;

  return db.transaction("rw", db.activities, db.intervals, async () => {
    const [activity, inProgress] = await Promise.all([
      getActivity(activityId),
      isInProgress(activityId),
    ]);

    if (!inProgress) {
      // Create a new interval for the activity
      const newIntervalCreation = db.intervals.add({
        activityId,
        start: startTime,
        end: MAX_DATE_MS, // End time will be set when the activity is stopped
      });

      const stoppingAncestors = stopAncestors(activity, startTime);
      await Promise.all([newIntervalCreation, stoppingAncestors]);
    }

    if (!activity.expanded) {
      await db.activities.update(activityId, { expanded: 1 });
    }
  });
}
