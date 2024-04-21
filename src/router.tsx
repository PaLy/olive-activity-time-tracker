import { RouteObject, useRouteError } from "react-router-dom";
import App from "./App";
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
import { fetchActivityByInterval } from "./data/activity/Operations";
import { QueryClient } from "@tanstack/react-query";

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);
  return <>Not Found</>;
};

export const createRoutes = (queryClient: QueryClient): RouteObject[] => [
  {
    path: "/",
    element: <App queryClient={queryClient} />,
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
];
