import { render } from "@testing-library/react";
import { RouterProvider } from "react-router-dom";
import { createRouter } from "../router";
import { QueryClient } from "@tanstack/react-query";

export const renderApp = () =>
  render(
    <RouterProvider router={createRouter(new QueryClient())}></RouterProvider>,
  );
