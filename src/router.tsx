import { createHashRouter } from "react-router-dom";
import App from "./App";
import { TodayRoute } from "./routes/activitylists/TodayRoute";
import { DayRoute } from "./routes/activitylists/DayRoute";
import { MonthRoute } from "./routes/activitylists/MonthRoute";
import { DateRangeRoute } from "./routes/activitylists/DateRangeRoute";
import { ActivityRoute } from "./routes/activity/ActivityRoute";
import { afterDBLoaded } from "./data/Storage";
import { activities } from "./data/activity/Signals";
import {
  EditInterval,
  EditIntervalLoaderData,
} from "./routes/activity/EditInterval";
import { intervals } from "./data/interval/Signals";
import { getActivityByInterval } from "./data/activity/Algorithms";
import { signal } from "@preact/signals-react";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <>Not Found</>,
    children: [
      {
        index: true,
        element: <TodayRoute />,
      },
      {
        path: "today/*",
        element: <TodayRoute />,
      },
      {
        path: "day/*",
        element: <DayRoute />,
      },
      {
        path: "month/*",
        element: <MonthRoute />,
      },
      {
        path: "range/*",
        element: <DateRangeRoute />,
      },
      {
        path: "activities/:activityID",
        element: <ActivityRoute />,
        loader: ({ params }) =>
          afterDBLoaded(async () => {
            const { activityID } = params;
            if (activityID) {
              const activity = activities.value.get(activityID);
              if (activity) {
                return activity;
              }
            }
            throw new Error("Activity does not exist.");
          }),
        children: [
          {
            path: "interval/:intervalID",
            element: <EditInterval />,
            loader: ({ params }) =>
              afterDBLoaded(async () => {
                const { intervalID } = params;
                if (intervalID) {
                  const interval = intervals.value.get(intervalID);
                  const activity = getActivityByInterval(intervalID);
                  if (interval && activity) {
                    const data: EditIntervalLoaderData = {
                      activity,
                      interval,
                      edit: signal({
                        start: signal(interval.value.start),
                        startError: signal(""),
                        end: signal(interval.value.end),
                        endError: signal(""),
                      }),
                    };
                    return data;
                  }
                }
                throw new Error("Interval does not exist.");
              }),
          },
        ],
      },
    ],
  },
]);
