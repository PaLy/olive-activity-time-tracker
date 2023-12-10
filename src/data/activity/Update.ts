import { Activity, store } from "./Storage";
import { activities, inProgressActivities, rootActivity } from "./Signals";
import { batch, signal } from "@preact/signals-react";
import {
  getDescendants,
  getNonRootAncestors,
  getOwnIntervals,
  isSelfInProgress,
} from "./Algorithms";
import moment from "moment/moment";
import { nanoid } from "nanoid";
import { addInterval } from "../interval/Update";

export const addActivity = (activity: Activity) => {
  const { id } = activity;
  const parentID = activity.parentID.value;
  const parent = activities.value.get(parentID)!;
  parent.childIDs.value = [...parent.childIDs.value, id];
  store.set(id, activity);
};

export const stopActivity = (activity: Activity) => {
  batch(() => {
    [activity, ...getDescendants(activity)]
      .filter(isSelfInProgress)
      .forEach(stopSelfActivity);

    const parentID = activity.parentID.value;
    if (parentID !== rootActivity.value.id) {
      const parent = activities.value.get(parentID)!;
      if (!inProgressActivities.value.has(parent)) {
        startActivity(parent);
      }
    }
  });
};

const stopSelfActivity = (activity: Activity) => {
  getOwnIntervals(activity).slice(-1)[0].end.value = moment();
};

export const startActivity = (activity: Activity) => {
  batch(() => {
    getNonRootAncestors(activity)
      .filter(isSelfInProgress)
      .forEach(stopSelfActivity);

    const id = nanoid();
    addInterval({ id, start: signal(moment()), end: signal(null) });
    activity.intervalIDs.value = [...activity.intervalIDs.value, id];
  });
};
