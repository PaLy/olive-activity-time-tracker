import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import { enableMapSet } from "immer";
import { createRoutes } from "./router";
import { QueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

enableMapSet();

const root = createRoot(document.getElementById("root")!);
root.render(
  <RouterProvider router={createHashRouter(createRoutes(new QueryClient()))} />,
);
