import Dexie, { EntityTable } from "dexie";
import { Activity, Interval, Setting } from "./entities";

export class OliveDB extends Dexie {
  activities!: EntityTable<Activity, "id">;
  intervals!: EntityTable<Interval, "id">;
  settings!: EntityTable<Setting, "id">;

  constructor() {
    super("Olive");
    this.version(1).stores({
      activities: "++id, name, parentId, expanded",
      intervals: "++id, activityId, start, end",
      settings: "key",
    });

    // Version 2: Add notificationsEnabled field to activities
    this.version(2)
      .stores({
        activities: "++id, name, parentId, expanded, notificationsEnabled",
        intervals: "++id, activityId, start, end",
        settings: "key",
      })
      .upgrade((tx) => {
        // Set default value for existing activities
        return tx
          .table("activities")
          .toCollection()
          .modify((activity) => {
            if (activity.notificationsEnabled === undefined) {
              activity.notificationsEnabled = 1;
            }
          });
      });

    this.activities.mapToClass(Activity);
    this.intervals.mapToClass(Interval);
    this.settings.mapToClass(Setting);
  }
}

export const db = new OliveDB();
