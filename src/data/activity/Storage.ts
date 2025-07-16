import { Store } from "../Store";
import { stringArray } from "../JsonSchema";
import { JTDSchemaType } from "ajv/dist/jtd";
import { Interval } from "../interval/Interval";
import { intervalStore } from "../interval/Storage";

export const STORE_NAME_ACTIVITIES = "activities";

class ActivityStore extends Store<StoredActivity, Activity> {
  constructor() {
    super({ name: STORE_NAME_ACTIVITIES });
  }

  asValue = async (activity: StoredActivity) => {
    const intervals = await Promise.all(
      activity.intervalIDs.map((id) => intervalStore.get(id)),
    );

    for (const interval of intervals) {
      if (interval === null) {
        throw new Error("Interval not found.");
      }
    }

    return {
      id: activity.id,
      name: activity.name,
      intervals: intervals as Interval[],
      parentID: activity.parentID,
      childIDs: activity.childIDs,
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

  override afterLoaded = async (activities: Map<string, Activity>) => {
    const rootChildIDs = Array.from(activities.values())
      .filter(
        (activity) => activity.parentID === "root" && activity.id !== "root",
      )
      .map((activity) => activity.id);

    activities.set("root", {
      id: "root",
      name: "",
      parentID: "root",
      childIDs: rootChildIDs,
      intervals: [],
    });
  };

  override fromExportedValue = (
    activity: StoredActivity,
  ): [string, StoredActivity] => [activity.id, activity];
}

export const activityStore = new ActivityStore();

export type Activity = {
  id: string;
  name: string;
  intervals: Interval[];
  parentID: string;
  childIDs: string[];
};

export type StoredActivity = {
  id: string;
  name: string;
  intervalIDs: string[];
  parentID: string;
  childIDs: string[];
};
