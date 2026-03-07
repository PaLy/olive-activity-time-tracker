import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { createRoutes } from "../router";
import {
  TestThemeContext,
  TestThemeContextType,
  ThemeOptions,
} from "../../components/Theme";
import { produce } from "immer";

const testThemeContextValue: TestThemeContextType = {
  modifyTheme: (theme: ThemeOptions) =>
    produce(theme ?? {}, (draft) => {
      if (!draft.transitions) draft.transitions = {};
      if (!draft.transitions.duration) draft.transitions.duration = {};
      draft.transitions.duration.enteringScreen = 0;
      draft.transitions.duration.leavingScreen = 0;
    }),
};

describe("router", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders ErrorBoundary for invalid routes", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    render(
      <TestThemeContext.Provider value={testThemeContextValue}>
        <RouterProvider
          router={createMemoryRouter(createRoutes(), {
            initialEntries: ["/this-route-does-not-exist"],
          })}
        />
      </TestThemeContext.Provider>,
    );

    expect(await screen.findByText("Not Found")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });
});
