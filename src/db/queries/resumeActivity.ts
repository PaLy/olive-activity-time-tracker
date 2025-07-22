import { getActivity, isInProgress, stopAncestors } from "./activities";
import { MAX_DATE_MS } from "../../utils/Date";
import { db } from "../db";

type ResumeActivityParams = {
  activityId: number;
  startTime: number;
};

export async function resumeActivity(params: ResumeActivityParams) {
  const { activityId, startTime } = params;

  return db.transaction("rw", db.activities, db.intervals, async () => {
    const activity = await getActivity(activityId);

    const inProgress = await isInProgress(activityId);

    if (!inProgress) {
      // Create a new interval for the activity
      await db.intervals.add({
        activityId,
        start: startTime,
        end: MAX_DATE_MS, // End time will be set when the activity is stopped
      });

      await stopAncestors(activity, startTime);
    }

    if (!activity.expanded) {
      await db.activities.update(activityId, { expanded: 1 });
    }
  });
}
