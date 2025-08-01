import { db } from "../db";
import { Activity } from "../entities";
import { getInProgressIntervalIds, getInProgressIntervals } from "./intervals";

export async function checkActivityExist(activityId: number) {
  const activity = await getActivity(activityId);
  return activity.id;
}

export async function getActivity(activityId: number) {
  const activity = await db.activities.get(activityId);
  if (!activity) {
    throw new Error(`Activity with ID ${activityId} does not exist.`);
  }
  return activity;
}

export const getParent = async (activity: Activity) => {
  if (activity.parentId === -1) {
    return undefined; // Root activity has no parent
  }
  return db.activities.get(activity.parentId);
};

export async function stopAncestors(activity: Activity, stopTime: number) {
  const intervalIdsToStop: number[] = [];

  let ancestor = await getParent(activity);
  while (ancestor) {
    const inProgressIntervals = await getInProgressIntervalIds(ancestor.id);
    intervalIdsToStop.push(...inProgressIntervals);
    ancestor = await getParent(ancestor);
  }

  await db.intervals.bulkUpdate(
    intervalIdsToStop.map((id) => ({
      key: id,
      changes: { end: stopTime },
    })),
  );
}

export async function stopSelfAndDescendants(
  activity: Activity,
  stopTime: number,
) {
  const intervalIdsToStop: number[] = [];

  // Stop all intervals for the activity itself
  const inProgressIntervals = await getInProgressIntervalIds(activity.id);
  intervalIdsToStop.push(...inProgressIntervals);

  // Stop all intervals for descendants recursively
  const descendants = await getDescendants(activity);
  for (const descendant of descendants) {
    const descendantIntervals = await getInProgressIntervalIds(descendant.id);
    intervalIdsToStop.push(...descendantIntervals);
  }

  await db.intervals.bulkUpdate(
    intervalIdsToStop.map((id) => ({
      key: id,
      changes: { end: stopTime },
    })),
  );
}

export async function getDescendants(activity: Activity): Promise<Activity[]> {
  const descendants: Activity[] = [];
  const queue = [activity.id];

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const children = await db.activities
      .where("parentId")
      .equals(parentId)
      .toArray();

    descendants.push(...children);
    queue.push(...children.map((child) => child.id));
  }

  return descendants;
}

export async function getAncestorsById(
  activityId: number,
): Promise<Activity[]> {
  const activity = await db.activities.get(activityId);
  if (!activity) {
    throw new Error(`Activity with ID ${activityId} does not exist.`);
  }
  return getAncestors(activity);
}

export async function getAncestors(activity: Activity): Promise<Activity[]> {
  const ancestors: Activity[] = [];
  let currentActivityId = activity.parentId;

  while (currentActivityId !== -1) {
    const ancestor = await db.activities.get(currentActivityId);
    if (!ancestor) break;
    ancestors.push(ancestor);
    currentActivityId = ancestor.parentId;
  }

  return ancestors.reverse();
}

export async function getInProgressActivitiesCount(): Promise<number> {
  const inProgressActivityIds = await getInProgressActivityIds();
  return inProgressActivityIds.size;
}

export async function getInProgressActivityIds(): Promise<Set<number>> {
  return db.transaction("r", db.intervals, db.activities, async () => {
    const activityIds = await getSelfInProgressActivityIds();

    await Promise.all(
      Array.from(activityIds).map(async (activityId) => {
        const ancestors = await getAncestorsById(activityId);
        ancestors.forEach((ancestor) => {
          activityIds.add(ancestor.id);
        });
      }),
    );

    return activityIds;
  });
}

export async function isInProgress(activityId: number) {
  const inProgressActivityIds = await getInProgressActivityIds();
  return inProgressActivityIds.has(activityId);
}

export async function getSelfInProgressActivityIds() {
  return db.transaction("r", db.intervals, db.activities, async () => {
    const intervals = await getInProgressIntervals().toArray();
    return new Set(intervals.map((interval) => interval.activityId));
  });
}

export async function expandAllActivities() {
  await db.activities.where("expanded").equals(0).modify({ expanded: 1 });
}

export async function collapseAllActivities() {
  await db.activities.where("expanded").equals(1).modify({ expanded: 0 });
}

export async function setExpanded(activityId: number, expanded: boolean) {
  await db.activities.update(activityId, { expanded: expanded ? 1 : 0 });
}

export async function expandSelfAndAncestors(activityId: number) {
  await db.transaction("rw", db.activities, async () => {
    const activityIdsToExpand: number[] = [];
    let currentActivityId = activityId;

    while (currentActivityId !== -1) {
      const activity = await db.activities.get(currentActivityId);
      if (!activity) break;

      if (!activity.expanded) {
        activityIdsToExpand.push(activity.id);
      }

      currentActivityId = activity.parentId;
    }

    if (activityIdsToExpand.length > 0) {
      await db.activities.bulkUpdate(
        activityIdsToExpand.map((id) => ({
          key: id,
          changes: { expanded: 1 },
        })),
      );
    }
  });
}

export async function getFullName(activity: Activity): Promise<string> {
  const ancestors = await getAncestors(activity);
  return ancestors
    .concat([activity])
    .map((a) => a.name)
    .join(" / ");
}

export async function getSiblingActivities(
  activityId: number,
): Promise<Activity[]> {
  const activity = await getActivity(activityId);
  return db.activities
    .where("parentId")
    .equals(activity.parentId)
    .and((sibling) => sibling.id !== activityId) // Exclude the current activity
    .toArray();
}

export async function editActivityName(
  activityId: number,
  newName: string,
): Promise<void> {
  await db.activities.update(activityId, { name: newName });
}
