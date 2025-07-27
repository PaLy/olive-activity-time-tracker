import { RouteObject, useRouteError } from "react-router";
import App from "../components/App";
import { ActivityDetailsPage } from "../features/activityDetails/ActivityDetailsPage";
import { EditInterval } from "../features/activityDetails/EditInterval";
import { ActivityListPage } from "../features/activityList/ActivityListPage";
import { StorageModal } from "../features/storage/storagePage/StorageModal";

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
        path: "activities/:activityID/*",
        element: <ActivityDetailsPage />,
        children: [
          {
            path: "interval/:intervalID",
            element: <EditInterval />,
          },
        ],
      },
      {
        path: "storage",
        element: <StorageModal />,
      },
    ],
  },
];
