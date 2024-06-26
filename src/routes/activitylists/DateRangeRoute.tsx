import { ActivityList, ActivityListFilter } from "./ActivityList";
import { computed, signal } from "@preact/signals-react";
import { Grid } from "@mui/material";
import moment from "moment";
import humanizeDuration from "humanize-duration";
import { ChipDayPicker } from "../../components/ChipDayPicker";
import { OrderBy } from "../../data/activity/Algorithms";

export const DateRangeRoute = () => (
  <ActivityList
    interval={interval}
    header={humanizedDuration}
    filter={filter}
    orderBy={orderBy}
  />
);

const orderBy = signal(OrderBy.Duration);

const start = signal(moment().subtract(6, "days"));
const end = signal(moment());

const filter = computed<ActivityListFilter>(() => ({
  element: (
    <Grid
      container
      justifyContent={"center"}
      sx={{ gap: 1 }}
      alignItems={"center"}
    >
      <ChipDayPicker value={start} maxDate={end.value} />
      —
      <ChipDayPicker value={end} minDate={start.value} disableFuture />
    </Grid>
  ),
  initialHeight: 40,
}));

const istart = computed(() => start.value.clone().startOf("day").valueOf());
const iend = computed(() =>
  end.value.clone().add(1, "day").startOf("day").valueOf(),
);

const interval = computed(() => ({
  start: istart,
  end: iend,
}));

const humanizedDuration = computed(() =>
  humanizeDuration(interval.value.end.value - interval.value.start.value, {
    delimiter: " ",
    // units and rounding are needed, because one month is not defined in full days
    units: ["y", "mo", "w", "d"],
    round: true,
  }),
);
