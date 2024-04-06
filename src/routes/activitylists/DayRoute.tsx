import { ActivityList, ActivityListFilter } from "./ActivityList";
import { computed, signal } from "@preact/signals-react";
import moment from "moment";
import { ChipDayPicker } from "../../components/ChipDayPicker";
import { OrderBy } from "../../data/activity/Algorithms";

/**
 * TODO don't display play buttons? (if activity has started today, it will still have a play button)
 */
export const DayRoute = () => (
  <ActivityList
    interval={interval}
    header={header}
    filter={filter}
    orderBy={orderBy}
  />
);

const orderBy = signal(OrderBy.Duration);

const header = signal("Day");

const day = signal(moment().subtract(1, "day"));

const filter = signal<ActivityListFilter>({
  element: (
    <ChipDayPicker
      maxDate={moment().subtract(1, "day")}
      value={day}
      isMaxDate={(value) => value.isSame(moment().subtract(1, "day"), "day")}
      onBefore={(value) => value.clone().subtract(1, "day")}
      onNext={(value) => value.clone().add(1, "day")}
    />
  ),
  initialHeight: 40,
});

const interval = computed(() => ({
  start: startOfDay,
  end: endOfDay,
}));
const startOfDay = computed(() => day.value.clone().startOf("day").valueOf());
const endOfDay = computed(() => day.value.clone().endOf("day").valueOf());
