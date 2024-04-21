import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { createRoutes } from "../router";
import { QueryClient } from "@tanstack/react-query";

type RenderAppOptions = {
  route?: string;
};

export const renderApp = (options?: RenderAppOptions) => {
  const { route = "/" } = options ?? {};
  return render(
    <RouterProvider
      router={createMemoryRouter(createRoutes(new QueryClient()), {
        initialEntries: [route],
      })}
    ></RouterProvider>,
  );
};
