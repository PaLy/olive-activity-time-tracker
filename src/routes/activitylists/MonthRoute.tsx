import { ActivityList, ActivityListFilter } from "./ActivityList";
import { computed, signal } from "@preact/signals-react";
import moment from "moment";
import { ChipDatePicker } from "../../components/ChipDatePicker";
import { OrderBy } from "../../data/activity/Algorithms";

export const MonthRoute = () => (
  <ActivityList
    interval={interval}
    header={header}
    filter={filter}
    orderBy={orderBy}
  />
);

const orderBy = signal(OrderBy.Duration);

const header = signal("Month");

const month = signal(moment());

const filter = signal<ActivityListFilter>({
  element: (
    <ChipDatePicker
      disableFuture
      format={"MMMM YYYY"}
      views={["year", "month"]}
      openTo={"month"}
      value={month}
      isMaxDate={(value) => value.isSame(moment(), "month")}
      onBefore={(value) => value.clone().subtract(1, "month")}
      onNext={(value) => value.clone().add(1, "month")}
    />
  ),
  initialHeight: 40,
});

const interval = computed(() => ({
  start: startOfDay,
  end: endOfDay,
}));
const startOfDay = computed(() =>
  month.value.clone().startOf("month").valueOf(),
);
const endOfDay = computed(() => month.value.clone().endOf("month").valueOf());
