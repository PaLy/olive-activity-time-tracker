import Dexie from "dexie";
import {
  OldDbActivity,
  OldDbActivityInListExpanded,
  OldDbInterval,
} from "./db.types";
import { keyBy } from "lodash";
import { OliveDB } from "./OliveDB";
import { ActivityListSettingValue, SettingKey } from "./entities";
import { MAX_DATE_MS } from "../utils/Date";

export const db = new OliveDB();

const oldDbActivities = new Dexie("activities");
oldDbActivities.version(0.2).stores({
  keyvaluepairs: "",
  "local-forage-detect-blob-support": "",
});

const oldDbActivityInListExpanded = new Dexie("activityInListExpanded");
oldDbActivityInListExpanded.version(0.2).stores({
  keyvaluepairs: "",
  "local-forage-detect-blob-support": "",
});

const oldDbIntervals = new Dexie("intervals");
oldDbIntervals.version(0.2).stores({
  keyvaluepairs: "",
  "local-forage-detect-blob-support": "",
});

const oldDbSettings = new Dexie("settings");
oldDbSettings.version(0.2).stores({
  keyvaluepairs: "",
  "local-forage-detect-blob-support": "",
});

async function migrateData() {
  const activityInListExpanded: OldDbActivityInListExpanded[] = [];
  await oldDbActivityInListExpanded
    .table("keyvaluepairs")
    .each((obj, cursor) => {
      activityInListExpanded.push({ key: cursor.key, value: obj });
    });

  const activityInListExpandedMap = keyBy(activityInListExpanded, "key");

  const intervals: OldDbInterval[] = await oldDbIntervals
    .table("keyvaluepairs")
    .toArray();

  const intervalsMap = keyBy(intervals, "id");

  const activities: OldDbActivity[] = await oldDbActivities
    .table("keyvaluepairs")
    .toArray()
    .then(mergeSameNamedSiblingActivities);

  activities.forEach((activity, index) => (activity.newId = index + 1));

  const activitiesMaps = keyBy(activities, "id");

  activities.forEach((activity) => {
    const parentId = activity.parentID;
    if (parentId !== "root") {
      activity.newParentId = activitiesMaps[parentId]?.newId;
    }

    activity.intervalIDs.forEach((intervalID) => {
      const interval = intervalsMap[intervalID];
      if (interval) {
        interval.newActivityId = activity.newId;
      }
    });

    if (activityInListExpandedMap[activity.id]) {
      activity.newExpanded = true;
    }
  });

  const settings: ActivityListSettingValue[] = await oldDbSettings
    .table("keyvaluepairs")
    .toArray();

  await db.transaction(
    "rw",
    db.activities,
    db.intervals,
    db.settings,
    async () => {
      await db.activities.bulkAdd(
        activities.map((activity) => ({
          name: activity.name,
          parentId: activity.newParentId ?? -1,
          expanded: activity.newExpanded ? 1 : 0,
        })),
      );
      await db.intervals.bulkAdd(
        intervals
          .filter((interval) => {
            if (interval.newActivityId === undefined) {
              // this may have happened in the past when no transactions were used
              console.warn(
                `Interval with ID ${interval.id} does not belong to any activity. Skipping.`,
              );
              return false;
            } else {
              return true;
            }
          })
          .map((interval) => ({
            activityId: interval.newActivityId!,
            start: interval.start,
            end: interval.end ?? MAX_DATE_MS,
          })),
      );
      if (settings.length > 0) {
        await db.settings.add({
          key: SettingKey.ACTIVITY_LIST,
          value: settings[0],
        });
      }
    },
  );

  await deleteOldDatabases();
}

function mergeSameNamedSiblingActivities(activities: OldDbActivity[]) {
  const mergedActivities: OldDbActivity[] = [];
  const activityMap = new Map<string, OldDbActivity>();

  activities.forEach((activity) => {
    const key = `${activity.name}$$$${activity.parentID}`;
    if (activityMap.has(key)) {
      const existingActivity = activityMap.get(key)!;
      existingActivity.intervalIDs.push(...activity.intervalIDs);
    } else {
      activityMap.set(key, activity);
    }
  });

  activityMap.forEach((activity) => mergedActivities.push(activity));

  return mergedActivities;
}

async function deleteOldDatabases() {
  await oldDbActivities.delete();
  await oldDbActivityInListExpanded.delete();
  await oldDbIntervals.delete();
  await oldDbSettings.delete();
}

await migrateData().catch((e) => {
  console.error("Error during migration:", e);
});
