import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { TodayRoute } from "./routes/activitylists/TodayRoute";
import { ThisMonthRoute } from "./routes/activitylists/ThisMonthRoute";
import { AllTimeRoute } from "./routes/activitylists/AllTimeRoute";
import { YesterdayRoute } from "./routes/activitylists/YesterdayRoute";
import { ActivityRoute } from "./routes/activity/ActivityRoute";
import { activities } from "./data/activity/Signals";
import {
  EditInterval,
  EditIntervalLoaderData,
} from "./routes/activity/EditInterval";
import { intervals } from "./data/interval/Signals";
import { getActivityByInterval } from "./data/activity/Algorithms";
import { signal } from "@preact/signals-react";
import { enableMapSet } from "immer";
import { afterDBLoaded } from "./data/Storage";

enableMapSet();

const router = createHashRouter([
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
        path: "yesterday/*",
        element: <YesterdayRoute />,
      },
      {
        path: "month/*",
        element: <ThisMonthRoute />,
      },
      {
        path: "all/*",
        element: <AllTimeRoute />,
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
                      edit: {
                        start: signal(interval.start.value),
                        end: signal(interval.end.value),
                      },
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

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
