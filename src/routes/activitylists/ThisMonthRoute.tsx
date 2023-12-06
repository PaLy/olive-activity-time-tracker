import { ActivityList } from "./ActivityList";
import { computed } from "@preact/signals-react";
import { durationRefreshTime } from "../../data/Activity";
import moment from "moment";

export const ThisMonthRoute = () => (
  <ActivityList interval={interval} subHeader={"This Month"} />
);

const interval = computed(() => ({
  start: startOfDay.value,
  end: endOfDay.value,
}));
const startOfDay = computed(() =>
  moment(durationRefreshTime.value).startOf("month").valueOf(),
);
const endOfDay = computed(() =>
  moment(durationRefreshTime.value).endOf("month").valueOf(),
);
