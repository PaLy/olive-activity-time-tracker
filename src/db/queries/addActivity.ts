import { db } from "../db";
import { MAX_DATE_MS } from "../../utils/Date";
import { checkActivityExist, expandSelfAndAncestors } from "./activities";

type AddActivityParams = {
  interval: {
    start: number;
    end?: number;
  };
} & (
  | {
      existingActivityId: number;
      parentId?: never;
      name?: never;
    }
  | {
      existingActivityId?: never;
      parentId?: number;
      name: string;
    }
);

export async function addActivity(params: AddActivityParams) {
  return db.transaction("rw", db.activities, db.intervals, async () => {
    const {
      parentId = -1,
      interval: { start, end = MAX_DATE_MS },
      existingActivityId,
      name,
    } = params;

    const activityId =
      existingActivityId !== undefined
        ? await checkActivityExist(existingActivityId)
        : await createActivity(name, parentId);

    const addInterval = db.intervals.add({ activityId, start, end });
    const expandActivities = expandSelfAndAncestors(activityId);
    await Promise.all([addInterval, expandActivities]);
  });
}

async function createActivity(name: string, parentId: number) {
  return db.activities.add({
    name,
    parentId,
    expanded: 0,
  });
}
