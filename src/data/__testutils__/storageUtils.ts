import { Activity, activityStore } from "../activity/Storage";
import { Interval } from "../interval/Interval";
import moment from "moment";

type PartialActivity = Partial<Omit<Activity, "intervals">> & {
  intervals?: Partial<Interval>[];
};

export const importActivities = async (activities: PartialActivity[]) => {
  await activityStore.load();
  for (let i = 0; i < activities.length; i++) {
    const partialActivity = activities[i];
    const id = partialActivity.id ?? i.toString();

    const activity = {
      id,
      name: `Activity ${id}`,
      childIDs: [],
      parentID: "root",
      ...partialActivity,
      intervals: [],
    };
    await activityStore.set(id, activity);

    const intervals = partialActivity.intervals ?? [];

    for (let j = 0; j < intervals.length; j++) {
      const interval = intervals[j];
      const intervalID = interval.id ?? `${id}-${j}`;
      await activityStore.addInterval(activity, {
        id: intervalID,
        start: moment(),
        ...interval,
      });
    }
  }
};
