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
    this.activities.mapToClass(Activity);
    this.intervals.mapToClass(Interval);
    this.settings.mapToClass(Setting);
  }
}
