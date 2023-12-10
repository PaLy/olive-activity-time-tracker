import { ActivityList } from "./ActivityList";
import { computed } from "@preact/signals-react";
import moment from "moment";
import { durationRefreshTime } from "../../data/interval/Signals";

/**
 * TODO don't display play buttons? (if activity has started today, it will still have a play button)
 */
export const YesterdayRoute = () => (
  <ActivityList interval={interval} subHeader={"Yesterday"} />
);

const interval = computed(() => ({
  start: startOfDay,
  end: endOfDay,
}));
const startOfDay = computed(() =>
  moment(durationRefreshTime.value)
    .subtract(24, "hours")
    .startOf("day")
    .valueOf(),
);
const endOfDay = computed(() =>
  moment(durationRefreshTime.value)
    .subtract(24, "hours")
    .endOf("day")
    .valueOf(),
);
