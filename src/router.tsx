import { RouteObject, useRouteError } from "react-router";
import App from "./App";
import { ActivityRoute } from "./routes/activity/ActivityRoute";
import { EditInterval } from "./routes/activity/EditInterval";
import { ActivityListPage } from "./features/activityList/ActivityListPage";

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
        element: <ActivityListPage interval={"today"} />,
      },
      {
        path: "today/*",
        element: <ActivityListPage interval={"today"} />,
      },
      {
        path: "day/*",
        element: <ActivityListPage interval={"day"} />,
      },
      {
        path: "month/*",
        element: <ActivityListPage interval={"month"} />,
      },
      {
        path: "range/*",
        element: <ActivityListPage interval={"range"} />,
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
