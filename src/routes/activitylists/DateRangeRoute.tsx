import { ActivityList } from "./ActivityList";
import { Grid } from "@mui/material";
import moment from "moment";
import humanizeDuration from "humanize-duration";
import { ChipDayPicker } from "../../components/ChipDayPicker";
import { useState } from "react";
import { OrderBy } from "../../features/activityList/constants";
import { SimpleInterval } from "../../utils/types";

export const DateRangeRoute = () => {
  const [start, setStart] = useState(moment().subtract(6, "days"));
  const [end, setEnd] = useState(moment());

  const istart = start.clone().startOf("day").valueOf();
  const iend = end.clone().add(1, "day").startOf("day").valueOf();
  const interval = { start: istart, end: iend };

  return (
    <ActivityList
      interval={interval}
      header={humanizedDuration(interval)}
      orderBy={OrderBy.Duration}
      filter={{
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
      }}
    />
  );
};

const humanizedDuration = (interval: SimpleInterval) =>
  humanizeDuration(interval.end - interval.start, {
    delimiter: " ",
    // units and rounding are needed, because one month is not defined in full days
    units: ["y", "mo", "w", "d"],
    round: true,
  });
