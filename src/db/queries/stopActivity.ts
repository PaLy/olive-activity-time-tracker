import { db } from "../db";
import { resumeActivity } from "./resumeActivity";
import { getActivity, getParent, stopSelfAndDescendants } from "./activities";

type StopActivityParams = {
  activityId: number;
  end: number;
};

export async function stopActivity(params: StopActivityParams) {
  const { activityId, end } = params;

  return db
    .transaction("rw", db.activities, db.intervals, async () => {
      const activity = await getActivity(activityId);

      await stopSelfAndDescendants(activity, end);

      await db.activities.update(activityId, { expanded: 0 });

      const parent = await getParent(activity);
      if (parent) {
        await resumeActivity({ activityId: parent.id, startTime: end });
      }
    })
    .catch((error) => {
      console.error(error);
      throw new Error(`Failed to stop activity.`);
    });
}
