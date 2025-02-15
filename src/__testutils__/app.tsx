import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
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

export const element = {
  find: {
    switch: async (name: RegExp) =>
      within(await screen.findByRole("switch", { name })).getByRole("checkbox"),
  },
};
