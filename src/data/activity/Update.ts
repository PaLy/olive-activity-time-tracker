import { Activity, activityStore } from "./Storage";
import { activities, inProgressActivities, rootActivity } from "./Signals";
import { batch, Signal, signal } from "@preact/signals-react";
import {
  getDescendants,
  getNonRootAncestors,
  getOwnIntervals,
  isSelfInProgress,
} from "./Algorithms";
import moment from "moment/moment";
import { nanoid } from "nanoid";
import { addInterval, deleteInterval } from "../interval/Update";
import { Interval } from "../interval/Interval";

export const addActivity = (activity: Activity) => {
  const { id } = activity;
  const parentID = activity.parentID.value;
  const parent = activities.value.get(parentID)!;
  parent.value.childIDs.value = [...parent.value.childIDs.value, id];
  activityStore.set(id, activity);
  // TODO clear ancestors intervals which overlaps this activity interval + confirmation modal?
  // TODO forbid overlap with own intervals
};

export const stopActivity = (activity: Signal<Activity>) => {
  batch(() => {
    [activity, ...getDescendants(activity)]
      .filter(isSelfInProgress)
      .forEach(stopSelfActivity);

    const parentID = activity.value.parentID.value;
    if (parentID !== rootActivity.value.id) {
      const parent = activities.value.get(parentID)!;
      if (!inProgressActivities.value.has(parent.value)) {
        startActivity(parent);
      }
    }
  });
};

const stopSelfActivity = (activity: Signal<Activity>) => {
  getOwnIntervals(activity).slice(-1)[0].value.end.value = moment();
};

export const startActivity = (activity: Signal<Activity>) => {
  batch(() => {
    getNonRootAncestors(activity)
      .filter(isSelfInProgress)
      .forEach(stopSelfActivity);

    const id = nanoid();
    addInterval({ id, start: signal(moment()), end: signal(null) });
    activity.value.intervalIDs.value = [
      ...activity.value.intervalIDs.value,
      id,
    ];
  });
};

export const deleteActivityInterval = (
  activity: Signal<Activity>,
  interval: Signal<Interval>,
) => {
  batch(() => {
    activity.value.intervalIDs.value = activity.value.intervalIDs.value.filter(
      (id) => id !== interval.value.id,
    );
    deleteInterval(interval);
  });
};
