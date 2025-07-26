import { useClockStore } from "../../utils/clock";
import { ActivityList, ActivityListProps } from "./ActivityList";
import { OrderBy } from "./constants";
import { ChipDayPicker } from "../../components/ChipDayPicker";
import moment from "moment/moment";
import { useState } from "react";
import { ChipDatePicker } from "../../components/ChipDatePicker";
import Grid from "@mui/material/Grid";
import { SimpleInterval } from "../../utils/types";
import humanizeDuration from "humanize-duration";

type ActivityListPageProps = {
  interval: ActivityListInterval;
};

type ActivityListInterval = "today" | "day" | "month" | "range";

export const ActivityListPage = (props: ActivityListPageProps) => {
  const { interval } = props;
  return <ActivityList {...useActivityList(interval)} />;
};

const useActivityList = (interval: ActivityListInterval): ActivityListProps => {
  const todayActivityList = useTodayActivityList();
  const dayActivityList = useDayActivityList();
  const monthActivityList = useMonthActivityList();
  const dateRangeActivityList = useDateRangeActivityList();
  switch (interval) {
    case "today":
      return todayActivityList;
    case "day":
      return dayActivityList;
    case "month":
      return monthActivityList;
    case "range":
      return dateRangeActivityList;
    default:
      throw new Error(`Unknown interval: ${interval}`);
  }
};

const useTodayActivityList = (): ActivityListProps => {
  const start = useClockStore((state) =>
    state.time.clone().startOf("day").valueOf(),
  );
  const end = useClockStore((state) =>
    state.time.clone().endOf("day").valueOf(),
  );
  return {
    interval: { start, end },
    header: "Today",
    orderBy: OrderBy.LastEndTime,
  };
};

const useDayActivityList = (): ActivityListProps => {
  const [day, setDay] = useState(yesterday());
  const start = day.startOf("day").valueOf();
  const end = day.endOf("day").valueOf();

  return {
    interval: { start, end },
    header: "Day",
    orderBy: OrderBy.Duration,
    filter: {
      element: (
        <ChipDayPicker
          maxDate={yesterday()}
          value={day}
          onChange={setDay}
          isMaxDate={(value) => value.isSame(yesterday(), "day")}
          onBefore={(value) => value.clone().subtract(1, "day")}
          onNext={(value) => value.clone().add(1, "day")}
        />
      ),
      initialHeight: 40,
    },
  };
};

const yesterday = () => moment().subtract(1, "day");

const useMonthActivityList = (): ActivityListProps => {
  const [month, setMonth] = useState(moment());
  const start = month.startOf("month").valueOf();
  const end = month.endOf("month").valueOf();

  return {
    interval: { start, end },
    header: "Month",
    orderBy: OrderBy.Duration,
    filter: {
      element: (
        <ChipDatePicker
          disableFuture
          format={"MMMM YYYY"}
          views={["year", "month"]}
          openTo={"month"}
          value={month}
          onChange={setMonth}
          isMaxDate={(value) => value.isSame(moment(), "month")}
          onBefore={(value) => value.clone().subtract(1, "month")}
          onNext={(value) => value.clone().add(1, "month")}
        />
      ),
      initialHeight: 40,
    },
  };
};

const useDateRangeActivityList = (): ActivityListProps => {
  const [start, setStart] = useState(moment().subtract(6, "days"));
  const [end, setEnd] = useState(moment());

  const istart = start.clone().startOf("day").valueOf();
  const iend = end.clone().add(1, "day").startOf("day").valueOf();
  const interval = { start: istart, end: iend };

  return {
    interval,
    header: humanizedDuration(interval),
    orderBy: OrderBy.Duration,
    filter: {
      element: (
        <Grid
          container
          justifyContent={"center"}
          sx={{ gap: 1 }}
          alignItems={"center"}
        >
          <ChipDayPicker value={start} onChange={setStart} maxDate={end} />
          —
          <ChipDayPicker
            value={end}
            onChange={setEnd}
            minDate={start}
            disableFuture
          />
        </Grid>
      ),
      initialHeight: 40,
    },
  };
};

const humanizedDuration = (interval: SimpleInterval) =>
  humanizeDuration(interval.end - interval.start, {
    delimiter: " ",
    // units and rounding are needed, because one month is not defined in full days
    units: ["y", "mo", "w", "d"],
    round: true,
  });
