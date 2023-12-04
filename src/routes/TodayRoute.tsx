import { ActivityList } from "./ActivityList";
import { computed } from "@preact/signals-react";
import { durationRefreshTime } from "../data/Activity";
import moment from "moment";

export const TodayRoute = () => (
  <ActivityList interval={interval} subHeader={"Today"} />
);

const interval = computed(() => ({
  start: startOfDay.value,
  end: endOfDay.value,
}));
const startOfDay = computed(() =>
  moment(durationRefreshTime.value).startOf("day").valueOf(),
);
const endOfDay = computed(() =>
  moment(durationRefreshTime.value).endOf("day").valueOf(),
);
