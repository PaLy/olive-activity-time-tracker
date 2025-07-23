import { db } from "../db";
import { resumeActivity } from "./resumeActivity";
import { getActivity, stopSelfAndDescendants } from "./activities";

type StopActivityParams = {
  activityId: number;
  end: number;
};

export async function stopActivity(params: StopActivityParams) {
  const { activityId, end } = params;

  return db.transaction("rw", db.activities, db.intervals, async () => {
    const activity = await getActivity(activityId);

    await Promise.all([
      stopSelfAndDescendants(activity, end),
      db.activities.update(activityId, { expanded: 0 }),
    ]);

    if (activity.parentId !== -1) {
      await resumeActivity({ activityId: activity.parentId, startTime: end });
    }
  });
}
