import { createHashRouter, useRouteError } from "react-router-dom";
import App, { queryClient } from "./App";
import { TodayRoute } from "./routes/activitylists/TodayRoute";
import { DayRoute } from "./routes/activitylists/DayRoute";
import { MonthRoute } from "./routes/activitylists/MonthRoute";
import { DateRangeRoute } from "./routes/activitylists/DateRangeRoute";
import { ActivityRoute } from "./routes/activity/ActivityRoute";
import {
  EditInterval,
  EditIntervalLoaderData,
} from "./routes/activity/EditInterval";
import { signal } from "@preact/signals-react";
import {
  fetchActivity,
  fetchActivityByInterval,
} from "./data/activity/Operations";

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);
  return <>Not Found</>;
};

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorBoundary />,
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
        loader: async ({ params }) => {
          const { activityID } = params;
          if (activityID) {
            const activity = await fetchActivity(queryClient, activityID);
            if (activity) {
              return activity;
            }
          }
          throw new Error("Activity does not exist.");
        },
        children: [
          {
            path: "interval/:intervalID",
            element: <EditInterval />,
            loader: async ({ params }) => {
              const { intervalID } = params;
              if (intervalID) {
                const activity = await fetchActivityByInterval(
                  queryClient,
                  intervalID,
                );
                const interval = activity?.intervals.find(
                  (it) => it.id === intervalID,
                );
                if (interval && activity) {
                  const data: EditIntervalLoaderData = {
                    activity,
                    interval,
                    edit: signal({
                      start: signal(interval.start),
                      startError: signal(""),
                      end: signal(interval.end),
                      endError: signal(""),
                    }),
                  };
                  return data;
                }
              }
              throw new Error("Interval does not exist.");
            },
          },
        ],
      },
    ],
  },
]);
