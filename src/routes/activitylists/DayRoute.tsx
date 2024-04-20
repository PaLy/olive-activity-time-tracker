import { ActivityList } from "./ActivityList";
import moment from "moment";
import { ChipDayPicker } from "../../components/ChipDayPicker";
import { OrderBy } from "../../data/activity/Algorithms";
import { useState } from "react";

/**
 * TODO don't display play buttons? (if activity has started today, it will still have a play button)
 */
export const DayRoute = () => {
  const [day, setDay] = useState(moment());
  const start = day.startOf("day").valueOf();
  const end = day.endOf("day").valueOf();

  return (
    <ActivityList
      interval={{ start, end }}
      header={"Day"}
      orderBy={OrderBy.Duration}
      filter={{
        element: (
          <ChipDayPicker
            maxDate={moment().subtract(1, "day")}
            value={day}
            onChange={setDay}
            isMaxDate={(value) =>
              value.isSame(moment().subtract(1, "day"), "day")
            }
            onBefore={(value) => value.clone().subtract(1, "day")}
            onNext={(value) => value.clone().add(1, "day")}
          />
        ),
        initialHeight: 40,
      }}
    />
  );
};
