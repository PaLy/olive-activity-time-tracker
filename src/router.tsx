import { RouteObject, useRouteError } from "react-router";
import App from "./App";
import { TodayRoute } from "./routes/activitylists/TodayRoute";
import { DayRoute } from "./routes/activitylists/DayRoute";
import { MonthRoute } from "./routes/activitylists/MonthRoute";
import { DateRangeRoute } from "./routes/activitylists/DateRangeRoute";
import { ActivityRoute } from "./routes/activity/ActivityRoute";
import { EditInterval } from "./routes/activity/EditInterval";

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error(error);
  return <>Not Found</>;
};

export const createRoutes = (): RouteObject[] => [
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
        children: [
          {
            path: "interval/:intervalID",
            element: <EditInterval />,
          },
        ],
      },
    ],
  },
];
