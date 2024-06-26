import { ActivityList } from "./ActivityList";
import { computed, signal } from "@preact/signals-react";
import moment from "moment";
import { durationRefreshTime } from "../../data/interval/Signals";
import { OrderBy } from "../../data/activity/Algorithms";

export const TodayRoute = () => {
  return (
    <>
      <ActivityList
        interval={interval}
        header={header}
        filter={filter}
        orderBy={orderBy}
      />
    </>
  );
};

const orderBy = signal(OrderBy.LastEndTime);

const filter = signal(undefined);

const header = signal("Today");

const interval = computed(() => ({
  start: startOfDay,
  end: endOfDay,
}));

const startOfDay = computed(() =>
  moment(durationRefreshTime.value).startOf("day").valueOf(),
);

const endOfDay = computed(() =>
  moment(durationRefreshTime.value).endOf("day").valueOf(),
);
