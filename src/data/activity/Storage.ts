import { Store } from "../Store";
import { stringArray } from "../JsonSchema";
import { JTDSchemaType } from "ajv/dist/jtd";
import { Interval } from "../interval/Interval";
import { nanoid } from "nanoid";
import moment from "moment";
import {
  getActivityByInterval,
  getDescendants,
  getNonRootAncestors,
  isSelfInProgress,
} from "./Algorithms";
import { intervalStore } from "../interval/Storage";
import { setExpanded } from "./ActivityInListExpanded";
import { produce } from "immer";

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
        throw new Error("Interval not found");
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

  asStoredValue = (activity: Activity): StoredActivity => ({
    id: activity.id,
    name: activity.name,
    intervalIDs: activity.intervals.map(({ id }) => id),
    parentID: activity.parentID,
    childIDs: activity.childIDs,
  });

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

    const root = activities.get("root");
    if (!root) {
      const newRoot = {
        id: "root",
        name: "",
        parentID: "root",
        childIDs: rootChildIDs,
        intervals: [],
      };
      await this.set("root", newRoot);
      activities.set("root", newRoot);
    } else {
      const updatedRoot = {
        ...root,
        childIDs: rootChildIDs,
      };
      await this.set("root", updatedRoot);
      activities.set("root", updatedRoot);
    }
    return activities;
  };

  override asExportedValue = (activity: StoredActivity) => {
    return activity.id === "root" ? null : activity;
  };

  override fromExportedValue = (
    activity: StoredActivity,
  ): [string, StoredActivity] => [activity.id, activity];

  removeInterval = async (activity: Activity, interval: Interval) => {
    try {
      await intervalStore.remove(interval.id);

      await this.set(activity.id, {
        ...activity,
        intervals: activity.intervals.filter(({ id }) => id !== interval.id),
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
        intervals: [...activity.intervals, interval],
      });
    } catch (error) {
      throw new Error(`Failed to add interval: ${error}`);
    }
  };

  start = async (activity: Activity) => {
    try {
      const inProgressAncestors = getNonRootAncestors(
        activity,
        this.cache!,
      ).filter(isSelfInProgress);
      await this.stopSelfActivities(inProgressAncestors);

      await this.addInterval(activity, { id: nanoid(), start: moment() });
    } catch (error) {
      throw new Error(`Failed to start activity: ${error}`);
    }
    await setExpanded(activity.id, true).catch(() => {
      // ignore
    });
  };

  stop = async (activity: Activity) => {
    const inProgressDescendants = [
      activity,
      ...getDescendants(activity, this.cache!),
    ].filter(isSelfInProgress);
    const parentID = activity.parentID;

    try {
      await this.stopSelfActivities(inProgressDescendants);

      if (parentID !== "root") {
        const parent = await this.get(parentID);
        if (parent && !isSelfInProgress(parent)) {
          await this.start(parent);
        }
      }
    } catch (error) {
      throw new Error(`Failed to stop activity: ${error}`);
    }
    setExpanded(activity.id, false).catch(() => {
      // ignore
    });
  };

  private stopSelfActivities = async (activities: Activity[]) => {
    for (const activity of activities) {
      if (activity.intervals.length > 0) {
        const end = moment();
        await intervalStore.editInterval(activity.intervals.slice(-1)[0], {
          end,
        });
        this.cache = produce(this.cache, (draft: Map<string, Activity>) => {
          draft.get(activity.id)!.intervals.slice(-1)[0].end = end;
        });
      }
    }
  };

  addActivity = async (activity: Activity) => {
    const { id } = activity;
    await activityStore.set(id, activity);

    const parentID = activity.parentID;
    const parent = await this.get(parentID);
    await this.set(parentID, {
      ...parent,
      childIDs: [...parent.childIDs, id],
    });

    // TODO clear ancestors intervals which overlaps this activity interval + confirmation modal?
    // TODO forbid overlap with own intervals
    return activity;
  };

  getByInterval = async (intervalID: string) => {
    return getActivityByInterval(intervalID, this.cache!);
  };
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
