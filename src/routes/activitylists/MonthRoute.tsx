import { ActivityList } from "./ActivityList";
import moment from "moment";
import { ChipDatePicker } from "../../components/ChipDatePicker";
import { useState } from "react";
import { OrderBy } from "../../features/activityList/constants";

export const MonthRoute = () => {
  const [month, setMonth] = useState(moment());
  const start = month.startOf("month").valueOf();
  const end = month.endOf("month").valueOf();

  return (
    <ActivityList
      interval={{ start, end }}
      header={"Month"}
      orderBy={OrderBy.Duration}
      filter={{
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
      }}
    />
  );
};
