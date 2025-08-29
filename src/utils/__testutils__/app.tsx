import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { createRoutes } from "../../router/router";
import {
  TestThemeContext,
  TestThemeContextType,
  ThemeOptions,
} from "../../components/Theme";
import { produce } from "immer";

type RenderAppOptions = {
  route?: string;
};

export const renderApp = (options?: RenderAppOptions) => {
  const { route = "/" } = options ?? {};
  return render(
    <TestThemeContext.Provider value={testThemeContextValue}>
      <RouterProvider
        router={createMemoryRouter(createRoutes(), {
          initialEntries: [route],
        })}
      ></RouterProvider>
    </TestThemeContext.Provider>,
  );
};

const testThemeContextValue: TestThemeContextType = {
  modifyTheme: (theme: ThemeOptions) =>
    produce(theme ?? {}, (draft) => {
      if (!draft.transitions) draft.transitions = {};
      if (!draft.transitions.duration) draft.transitions.duration = {};
      // this fixes quick closing and opening of the activity modal in tests
      draft.transitions.duration.enteringScreen = 0;
      draft.transitions.duration.leavingScreen = 0;
    }),
};
