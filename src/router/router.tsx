import { RouteObject, useRouteError } from "react-router";
import { lazy } from "react";
import App from "../components/App";
// Not lazy: suspending would swap in the fallback during the view transition.
// Likewise EditInterval loads its data in a loader, so it is ready on first render.
import { ActivityDetailsPage } from "../features/activityDetails/ActivityDetailsPage";
import {
  EditInterval,
  editIntervalLoader,
} from "../features/activityDetails/EditInterval";

// Lazy load route components for code-splitting
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
const ChartsModal = lazy(() =>
  import("../features/charts/ChartsModal").then((m) => ({
    default: m.ChartsModal,
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
            loader: editIntervalLoader,
          },
        ],
      },
      {
        path: "storage",
        element: <StorageModal />,
      },
      {
        path: "charts",
        element: <ChartsModal />,
      },
      // {
      //   path: "debug",
      //   element: <DebugPage />,
      // },
    ],
  },
];
