import { ActivityList } from "./ActivityList";
import { computed } from "@preact/signals-react";
import moment from "moment";
import { durationRefreshTime } from "../../data/interval/Signals";

export const ThisMonthRoute = () => (
  <ActivityList interval={interval} subHeader={"This Month"} />
);

const interval = computed(() => ({
  start: startOfDay,
  end: endOfDay,
}));
const startOfDay = computed(() =>
  moment(durationRefreshTime.value).startOf("month").valueOf(),
);
const endOfDay = computed(() =>
  moment(durationRefreshTime.value).endOf("month").valueOf(),
);
