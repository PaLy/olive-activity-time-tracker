import { ActivityList } from "./ActivityList";
import { computed, signal } from "@preact/signals-react";
import moment from "moment";
import { ChipDatePicker } from "../../components/ChipDatePicker";

export const MonthRoute = () => (
  <ActivityList
    interval={interval}
    header={header}
    filterComponent={filterComponent}
  />
);

const header = signal("Month");

const month = signal(moment());

const filterComponent = signal(
  <ChipDatePicker
    disableFuture
    format={"MMMM YYYY"}
    views={["year", "month"]}
    openTo={"month"}
    value={month}
    isMaxDate={(value) => value.isSame(moment(), "month")}
    onBefore={(value) => value.clone().subtract(1, "month")}
    onNext={(value) => value.clone().add(1, "month")}
  />,
);

const interval = computed(() => ({
  start: startOfDay,
  end: endOfDay,
}));
const startOfDay = computed(() =>
  month.value.clone().startOf("month").valueOf(),
);
const endOfDay = computed(() => month.value.clone().endOf("month").valueOf());
