import { computed, signal, Signal } from "@preact/signals-react";
import { SignalStore } from "./Storage";

export const MAX_ACTIVITY_DEPTH = 4;

export type Activity = {
  id: string;
  name: Signal<string>;
  intervalIds: Signal<string[]>;
  parentActivityID: Signal<string>;
  childActivityIDs: Signal<string[]>;
};

export type StoredActivity = {
  id: string;
  name: string;
  intervalIds: string[];
  parentActivityID: string;
  childActivityIDs: string[];
};

const asValue = (activity: StoredActivity): Activity => ({
  id: activity.id,
  name: signal(activity.name),
  intervalIds: signal(activity.intervalIds),
  parentActivityID: signal(activity.parentActivityID),
  childActivityIDs: signal(activity.childActivityIDs),
});

const asStoredValue = (activity: Activity): StoredActivity => ({
  id: activity.id,
  name: activity.name.value,
  intervalIds: activity.intervalIds.value,
  parentActivityID: activity.parentActivityID.value,
  childActivityIDs: activity.childActivityIDs.value,
});

const store = new SignalStore({
  name: "activity",
  asStoredValue,
  asValue,
  afterLoaded: () => {
    if (!activities.value.get("root")) {
      store.set("root", {
        id: "root",
        name: signal(""),
        parentActivityID: signal("root"),
        childActivityIDs: signal([]),
        intervalIds: signal([]),
      });
    }
  },
});

export const activities = computed(() => store.collection.value);

export const addActivity = (activity: Activity) => {
  const { id } = activity;
  const parentActivityId = activity.parentActivityID.value;
  const parentActivity = activities.value.get(parentActivityId)!;
  parentActivity.childActivityIDs.value = [
    ...parentActivity.childActivityIDs.value,
    id,
  ];
  store.set(activity.id, activity);
};
