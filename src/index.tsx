import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TodayRoute } from "./routes/activitylists/TodayRoute";
import { ThisMonthRoute } from "./routes/activitylists/ThisMonthRoute";
import { AllTimeRoute } from "./routes/activitylists/AllTimeRoute";
import { YesterdayRoute } from "./routes/activitylists/YesterdayRoute";

const router = createBrowserRouter([
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
        path: "yesterday",
        element: <YesterdayRoute />,
      },
      {
        path: "month",
        element: <ThisMonthRoute />,
      },
      {
        path: "all",
        element: <AllTimeRoute />,
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
