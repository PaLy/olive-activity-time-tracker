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
import { IntervalEdit, intervalStore } from "../interval/Storage";
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

    activities.set("root", {
      id: "root",
      name: "",
      parentID: "root",
      childIDs: rootChildIDs,
      intervals: [],
    });
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
      console.error(error);
      throw new Error(`Failed to remove interval.`);
    }
  };

  addInterval = async (activityID: string, interval: Interval) => {
    try {
      const activity = await this.get(activityID);

      await intervalStore.set(interval.id, interval);

      await this.set(activity.id, {
        ...activity,
        intervals: [...activity.intervals, interval],
      });
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to add interval.`);
    }
  };

  start = async (activity: Activity) => {
    try {
      const inProgressAncestors = getNonRootAncestors(
        activity,
        await this.load(),
      ).filter(isSelfInProgress);
      await this.stopSelfActivities(inProgressAncestors);

      await this.addInterval(activity.id, { id: nanoid(), start: moment() });
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to start activity.`);
    }
    await setExpanded(activity.id, true).catch((error) => {
      console.error(error);
    });
  };

  stop = async (activity: Activity) => {
    const inProgressDescendants = [
      activity,
      ...getDescendants(activity, await this.load()),
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
      console.error(error);
      throw new Error(`Failed to stop activity.`);
    }
    await setExpanded(activity.id, false).catch((error) => {
      console.error(error);
    });
  };

  private stopSelfActivities = async (activities: Activity[]) => {
    for (const activity of activities) {
      if (activity.intervals.length > 0) {
        const end = moment();
        await intervalStore.editInterval(activity.intervals.slice(-1)[0], {
          end,
        });
        const updatedActivity = produce(
          await this.get(activity.id),
          (draft) => {
            draft.intervals.slice(-1)[0].end = end;
          },
        );
        await this.set(activity.id, updatedActivity);
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
    return getActivityByInterval(intervalID, await this.load());
  };

  editInterval = async (
    activity: Activity,
    interval: Interval,
    edit: IntervalEdit,
  ) => {
    try {
      await intervalStore.editInterval(interval, edit);

      await this.set(activity.id, {
        ...activity,
        intervals: activity.intervals.map((activityInterval) =>
          activityInterval.id === interval.id
            ? { ...interval, ...edit }
            : activityInterval,
        ),
      });
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to edit interval.`);
    }
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
