import { db } from "../db";
import { Activity } from "../entities";
import { isInProgress } from "./activities";

export type AddActivityData = {
  activities: Map<number, AddActivityDataActivity>;
};

export type AddActivityDataActivity = {
  id: number;
  name: string;
  parent?: AddActivityDataActivity; // Undefined parent for the root node
  children: AddActivityDataActivity[];
  inProgress: boolean;
};

export async function getAddActivityData(): Promise<AddActivityData> {
  const { activities: loadedActivities, inProgress } = await loadActivities();

  const loadedActivityMap = new Map<number, Activity>(
    loadedActivities.map((activity) => [activity.id, activity]),
  );

  const activities: AddActivityDataActivity[] = loadedActivities.map(
    (activity) => ({
      id: activity.id,
      name: activity.name,
      children: [],
      inProgress: !!inProgress.get(activity.id),
    }),
  );
  activities.push({
    id: -1, // Root activity ID
    name: "",
    children: [],
    inProgress: true,
  });
  const activityMap = new Map<number, AddActivityDataActivity>(
    activities.map((activity) => [activity.id, activity]),
  );

  activities.forEach((activity) => {
    const parentId = loadedActivityMap.get(activity.id)?.parentId;
    // If the parentId is undefined, it means it's the root activity
    if (parentId !== undefined) {
      const parent = activityMap.get(parentId);
      activity.parent = parent;
      parent?.children.push(activity);
    }
  });

  return {
    activities: activityMap,
  };
}

async function loadActivities() {
  return db.transaction("r", db.activities, db.intervals, async () => {
    const activities = await db.activities.toArray();

    const inProgress = new Map<number, boolean>(
      await Promise.all(
        activities.map(
          async (activity) =>
            [activity.id, await isInProgress(activity.id)] as const,
        ),
      ),
    );

    return { activities, inProgress };
  });
}
