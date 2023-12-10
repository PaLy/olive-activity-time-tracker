import { Signal, signal } from "@preact/signals-react";
import { SignalStore } from "../Storage";
import { activities } from "./Signals";

export const store = new SignalStore({
  name: "activity",
  asStoredValue,
  asValue,
  afterLoaded: () => {
    if (!activities.value.get("root")) {
      store.set("root", {
        id: "root",
        name: signal(""),
        parentID: signal("root"),
        childIDs: signal([]),
        intervalIDs: signal([]),
      });
    }
  },
});

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

function asValue(activity: StoredActivity): Activity {
  return {
    id: activity.id,
    name: signal(activity.name),
    intervalIDs: signal(activity.intervalIDs),
    parentID: signal(activity.parentID),
    childIDs: signal(activity.childIDs),
  };
}

function asStoredValue(activity: Activity): StoredActivity {
  return {
    id: activity.id,
    name: activity.name.value,
    intervalIDs: activity.intervalIDs.value,
    parentID: activity.parentID.value,
    childIDs: activity.childIDs.value,
  };
}
