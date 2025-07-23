import { db } from "../db";
import { Activity } from "../entities";
import { getInProgressActivityIds } from "./activities";

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
  const [loadedActivities, inProgressActivityIds] = await loadActivities();

  const loadedActivityMap = new Map<number, Activity>(
    loadedActivities.map((activity) => [activity.id, activity]),
  );

  const activities: AddActivityDataActivity[] = loadedActivities.map(
    (activity) => ({
      id: activity.id,
      name: activity.name,
      children: [],
      inProgress: inProgressActivityIds.has(activity.id),
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
  return db.transaction("r", db.activities, db.intervals, () => {
    return Promise.all([db.activities.toArray(), getInProgressActivityIds()]);
  });
}
