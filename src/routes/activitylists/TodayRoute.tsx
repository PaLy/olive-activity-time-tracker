import { ActivityList } from "./ActivityList";
import { computed } from "@preact/signals-react";
import moment from "moment";
import { durationRefreshTime } from "../../data/interval/Signals";

export const TodayRoute = () => {
  return (
    <>
      <ActivityList interval={interval} header={"Today"} />
    </>
  );
};

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
