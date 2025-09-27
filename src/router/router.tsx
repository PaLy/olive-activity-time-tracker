import { RouteObject, useRouteError } from "react-router";
import { lazy } from "react";
import App from "../components/App";

// Lazy load route components for code-splitting
const ActivityDetailsPage = lazy(() =>
  import("../features/activityDetails/ActivityDetailsPage").then((m) => ({
    default: m.ActivityDetailsPage,
  })),
);
const EditInterval = lazy(() =>
  import("../features/activityDetails/EditInterval").then((m) => ({
    default: m.EditInterval,
  })),
);
const ActivityListPage = lazy(() =>
  import("../features/activityList/ActivityListPage").then((m) => ({
    default: m.ActivityListPage,
  })),
);
const StorageModal = lazy(() =>
  import("../features/storage/storagePage/StorageModal").then((m) => ({
    default: m.StorageModal,
  })),
);
// const DebugPage = lazy(() =>
//   import("../features/debug/DebugPage").then((m) => ({
//     default: m.DebugPage,
//   })),
// );

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
      // {
      //   path: "debug",
      //   element: <DebugPage />,
      // },
    ],
  },
];
