import { Signal, signal } from "@preact/signals-react";
import { SignalStore } from "../SignalStore";

class ActivityStore extends SignalStore<StoredActivity, Activity> {
  constructor() {
    super({ name: "activity" });
  }

  asValue = (activity: StoredActivity): Activity => {
    return {
      id: activity.id,
      name: signal(activity.name),
      intervalIDs: signal(activity.intervalIDs),
      parentID: signal(activity.parentID),
      childIDs: signal(activity.childIDs),
    };
  };

  asStoredValue = (activity: Activity): StoredActivity => {
    return {
      id: activity.id,
      name: activity.name.value,
      intervalIDs: activity.intervalIDs.value,
      parentID: activity.parentID.value,
      childIDs: activity.childIDs.value,
    };
  };

  override afterLoaded = () => {
    if (!this.collection.value.get("root")) {
      this.set("root", {
        id: "root",
        name: signal(""),
        parentID: signal("root"),
        childIDs: signal([]),
        intervalIDs: signal([]),
      });
    }
  };

  override asExportedValue = (activity: StoredActivity) => {
    return activity.id === "root" ? null : activity;
  };
}

export const activityStore = new ActivityStore();

export type Activity = {
  id: string;
  name: Signal<string>;
  intervalIDs: Signal<string[]>;
  parentID: Signal<string>;
  childIDs: Signal<string[]>;
};

type StoredActivity = {
  id: string;
  name: string;
  intervalIDs: string[];
  parentID: string;
  childIDs: string[];
};
