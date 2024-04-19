import { Signal } from "@preact/signals-react";
import { Store } from "../Store";
import { stringArray } from "../JsonSchema";
import { JTDSchemaType } from "ajv/dist/jtd";
import { Interval } from "../interval/Interval";
import { nanoid } from "nanoid";
import moment from "moment";
import {
  getDescendants,
  getNonRootAncestors,
  getOwnIntervals,
  isSelfInProgress,
} from "./Algorithms";
import { intervalStore } from "../interval/Storage";
import { activities, rootActivity } from "./Signals";
import { setExpanded } from "./ActivityInListExpanded";

export const STORE_NAME_ACTIVITIES = "activities";

class ActivityStore extends Store<Activity> {
  constructor() {
    super({ name: STORE_NAME_ACTIVITIES });
  }

  asValue = (activity: Activity) => activity;
  asStoredValue = (activity: Activity) => activity;

  valueJsonSchema: JTDSchemaType<Activity[]> = {
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

  override afterLoaded = async () => {
    const rootChildIDs = [...this.collection.value.values()]
      .filter(
        (activity) =>
          activity.value.parentID === "root" && activity.value.id !== "root",
      )
      .map((activity) => activity.value.id);

    const root = this.collection.value.get("root");
    if (!root) {
      await this.set("root", {
        id: "root",
        name: "",
        parentID: "root",
        childIDs: rootChildIDs,
        intervalIDs: [],
      });
    } else {
      await this.set("root", {
        ...root.value,
        childIDs: rootChildIDs,
      });
    }
  };

  override asExportedValue = (activity: Activity) => {
    return activity.id === "root" ? null : activity;
  };

  override fromExportedValue = (activity: Activity): [string, Activity] => [
    activity.id,
    activity,
  ];

  removeInterval = async (
    activity: Signal<Activity>,
    interval: Signal<Interval>,
  ) => {
    try {
      await intervalStore.remove(interval.value.id);

      await this.set(activity.value.id, {
        ...activity.value,
        intervalIDs: activity.value.intervalIDs.filter(
          (id) => id !== interval.value.id,
        ),
      });
    } catch (error) {
      throw new Error(`Failed to remove interval: ${error}`);
    }
  };

  addInterval = async (activity: Activity, interval: Interval) => {
    try {
      await intervalStore.set(interval.id, interval);

      await this.set(activity.id, {
        ...activity,
        intervalIDs: [...activity.intervalIDs, interval.id],
      });
    } catch (error) {
      throw new Error(`Failed to add interval: ${error}`);
    }
  };

  start = async (activity: Activity) => {
    try {
      const activitiesToStop = getNonRootAncestors(activity)
        .map((it) => it.value)
        .filter(isSelfInProgress);
      await this.stopSelfActivities(activitiesToStop);

      await this.addInterval(activity, { id: nanoid(), start: moment() });
    } catch (error) {
      throw new Error(`Failed to start activity: ${error}`);
    }
    await setExpanded(activity.id, true).catch(() => {
      // ignore
    });
  };

  stop = async (activity: Signal<Activity>) => {
    const activitiesToStop = [activity, ...getDescendants(activity)]
      .map((it) => it.value)
      .filter(isSelfInProgress);
    const parentID = activity.value.parentID;

    try {
      await this.stopSelfActivities(activitiesToStop);

      if (parentID !== rootActivity.value.id) {
        const parent = await this.get(parentID);
        if (parent && !isSelfInProgress(parent)) {
          await this.start(parent);
        }
      }
    } catch (error) {
      throw new Error(`Failed to stop activity: ${error}`);
    }
    await setExpanded(activity.value.id, false).catch(() => {
      // ignore
    });
  };

  private stopSelfActivities = (activities: Activity[]) =>
    intervalStore.stopIntervals(
      activities.map(
        (activity) => getOwnIntervals(activity).slice(-1)[0].value,
      ),
    );

  addActivity = async (activity: Activity) => {
    const { id } = activity;
    await activityStore.set(id, activity);

    const parentID = activity.parentID;
    const parent = activities.value.get(parentID)!;
    await this.set(parentID, {
      ...parent.value,
      childIDs: [...parent.value.childIDs, id],
    });

    // TODO clear ancestors intervals which overlaps this activity interval + confirmation modal?
    // TODO forbid overlap with own intervals
    return activities.value.get(id)!;
  };
}

export const activityStore = new ActivityStore();

export type Activity = {
  id: string;
  name: string;
  intervalIDs: string[];
  parentID: string;
  childIDs: string[];
};
