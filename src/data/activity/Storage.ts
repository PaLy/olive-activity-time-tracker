import { Signal, signal } from "@preact/signals-react";
import { SignalStore } from "../SignalStore";
import { stringArray } from "../JsonSchema";
import { JTDSchemaType } from "ajv/dist/jtd";

export const STORE_NAME_ACTIVITIES = "activities";

class ActivityStore extends SignalStore<
  StoredActivity,
  Activity,
  StoredActivity
> {
  constructor() {
    super({ name: STORE_NAME_ACTIVITIES });
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

  valueJsonSchema: JTDSchemaType<StoredActivity[]> = {
    elements: {
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        intervalIDs: stringArray,
        parentID: { type: "string" },
        childIDs: stringArray,
      },
    },
  };

  override afterLoaded = () => {
    const rootChildIDs = [...this.collection.value.values()]
      .filter(
        (activity) =>
          activity.value.parentID.value === "root" &&
          activity.value.id !== "root",
      )
      .map((activity) => activity.value.id);

    const root = this.collection.value.get("root");
    if (!root) {
      this.set("root", {
        id: "root",
        name: signal(""),
        parentID: signal("root"),
        childIDs: signal(rootChildIDs),
        intervalIDs: signal([]),
      });
    } else {
      root.value.childIDs.value = rootChildIDs;
    }
  };

  override asExportedValue = (activity: StoredActivity) => {
    return activity.id === "root" ? null : activity;
  };

  override fromExportedValue = (
    activity: StoredActivity,
  ): [string, StoredActivity] => [activity.id, activity];
}

export const activityStore = new ActivityStore();

export type Activity = {
  id: string;
  name: Signal<string>;
  intervalIDs: Signal<string[]>;
  parentID: Signal<string>;
  childIDs: Signal<string[]>;
};

export type StoredActivity = {
  id: string;
  name: string;
  intervalIDs: string[];
  parentID: string;
  childIDs: string[];
};
