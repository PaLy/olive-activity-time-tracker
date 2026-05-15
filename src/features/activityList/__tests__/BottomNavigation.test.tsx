import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppBottomNavigation } from "../BottomNavigation";
import * as routerHooks from "../../../router/hooks";
import { useLiveQuery } from "dexie-react-hooks";
import * as activitiesModule from "../../../db/queries/activities";

// Mock dependencies
vi.mock("../../../router/hooks", () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock("../../../db/queries/activities", () => ({
  getInProgressActivitiesCount: vi.fn(),
}));

describe("AppBottomNavigation", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(routerHooks.useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useLiveQuery).mockReturnValue(0);
    vi.mocked(activitiesModule.getInProgressActivitiesCount).mockResolvedValue(
      0,
    );
  });

  it("renders all navigation actions", () => {
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/today",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<AppBottomNavigation />);

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("Month")).toBeInTheDocument();
    expect(screen.getByText("Date Range")).toBeInTheDocument();
  });

  it("displays badge with in-progress activities count", () => {
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/today",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    vi.mocked(useLiveQuery).mockReturnValue(3);

    render(<AppBottomNavigation />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("navigates to day page when Day is clicked from today", async () => {
    const user = userEvent.setup();
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/today",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<AppBottomNavigation />);

    const dayButton = screen.getByText("Day");
    await user.click(dayButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/day", { replace: false });
    });
  });

  it("navigates back when Today is clicked from another page", async () => {
    const user = userEvent.setup();
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/day",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<AppBottomNavigation />);

    const todayButton = screen.getByText("Today");
    await user.click(todayButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  it("navigates to month page when Month is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/today",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<AppBottomNavigation />);

    const monthButton = screen.getByText("Month");
    await user.click(monthButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/month", { replace: false });
    });
  });

  it("navigates to range page when Date Range is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/today",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<AppBottomNavigation />);

    const rangeButton = screen.getByText("Date Range");
    await user.click(rangeButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/range", { replace: false });
    });
  });

  it("does not navigate when clicking on current page", async () => {
    const user = userEvent.setup();
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/day",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<AppBottomNavigation />);

    const dayButton = screen.getByText("Day");
    await user.click(dayButton);

    await waitFor(
      () => {
        expect(mockNavigate).not.toHaveBeenCalled();
      },
      { timeout: 500 },
    );
  });

  it("handles error when getting in-progress activities count", async () => {
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/today",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    let capturedQueryFn: (() => Promise<unknown>) | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useLiveQuery).mockImplementation((queryFn: () => any) => {
      capturedQueryFn = queryFn;
      return "?";
    });
    vi.mocked(activitiesModule.getInProgressActivitiesCount).mockRejectedValue(
      new Error("Database error"),
    );

    render(<AppBottomNavigation />);

    expect(screen.getByText("Today")).toBeInTheDocument();

    // Execute and await the query function to ensure error is caught
    if (capturedQueryFn) {
      await capturedQueryFn().catch(() => {});
    }

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles nested paths correctly", async () => {
    const user = userEvent.setup();
    vi.mocked(routerHooks.useLocation).mockReturnValue({
      pathname: "/today/some/nested/path",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    render(<AppBottomNavigation />);

    const dayButton = screen.getByText("Day");
    await user.click(dayButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/day", { replace: false });
    });
  });
});
