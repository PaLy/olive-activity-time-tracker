import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppBarActions } from "../AppBarActions";
import * as activitiesModule from "../../../db/queries/activities";
import * as snackbarModule from "../../../components/AppSnackbarStore";

// Mock dependencies
vi.mock("../../../db/queries/activities", () => ({
  expandAllActivities: vi.fn(),
  collapseAllActivities: vi.fn(),
}));

vi.mock("../../../components/AppSnackbarStore", () => ({
  openErrorSnackbar: vi.fn(),
}));

describe("AppBarActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the menu button", () => {
    render(<AppBarActions />);
    const button = screen.getByLabelText("display more actions");
    expect(button).toBeInTheDocument();
  });

  it("opens menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(<AppBarActions />);

    const button = screen.getByLabelText("display more actions");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Expand All")).toBeInTheDocument();
      expect(screen.getByText("Collapse All")).toBeInTheDocument();
    });
  });

  it("calls expandAllActivities when Expand All is clicked", async () => {
    const user = userEvent.setup();
    const expandAllActivitiesMock = vi.mocked(
      activitiesModule.expandAllActivities,
    );
    expandAllActivitiesMock.mockResolvedValue(undefined);

    render(<AppBarActions />);

    const button = screen.getByLabelText("display more actions");
    await user.click(button);

    const expandAllItem = await screen.findByText("Expand All");
    await user.click(expandAllItem);

    expect(expandAllActivitiesMock).toHaveBeenCalledTimes(1);
  });

  it("calls collapseAllActivities when Collapse All is clicked", async () => {
    const user = userEvent.setup();
    const collapseAllActivitiesMock = vi.mocked(
      activitiesModule.collapseAllActivities,
    );
    collapseAllActivitiesMock.mockResolvedValue(undefined);

    render(<AppBarActions />);

    const button = screen.getByLabelText("display more actions");
    await user.click(button);

    const collapseAllItem = await screen.findByText("Collapse All");
    await user.click(collapseAllItem);

    expect(collapseAllActivitiesMock).toHaveBeenCalledTimes(1);
  });

  it("shows error snackbar when expandAllActivities fails", async () => {
    const user = userEvent.setup();
    const expandAllActivitiesMock = vi.mocked(
      activitiesModule.expandAllActivities,
    );
    const openErrorSnackbarMock = vi.mocked(snackbarModule.openErrorSnackbar);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expandAllActivitiesMock.mockRejectedValue(new Error("Test error"));

    render(<AppBarActions />);

    const button = screen.getByLabelText("display more actions");
    await user.click(button);

    const expandAllItem = await screen.findByText("Expand All");
    await user.click(expandAllItem);

    await waitFor(() => {
      expect(openErrorSnackbarMock).toHaveBeenCalledWith(
        "Failed to expand all activities",
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("shows error snackbar when collapseAllActivities fails", async () => {
    const user = userEvent.setup();
    const collapseAllActivitiesMock = vi.mocked(
      activitiesModule.collapseAllActivities,
    );
    const openErrorSnackbarMock = vi.mocked(snackbarModule.openErrorSnackbar);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    collapseAllActivitiesMock.mockRejectedValue(new Error("Test error"));

    render(<AppBarActions />);

    const button = screen.getByLabelText("display more actions");
    await user.click(button);

    const collapseAllItem = await screen.findByText("Collapse All");
    await user.click(collapseAllItem);

    await waitFor(() => {
      expect(openErrorSnackbarMock).toHaveBeenCalledWith(
        "Failed to collapse all activities",
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("closes menu after clicking Expand All", async () => {
    const user = userEvent.setup();
    const expandAllActivitiesMock = vi.mocked(
      activitiesModule.expandAllActivities,
    );
    expandAllActivitiesMock.mockResolvedValue(undefined);

    render(<AppBarActions />);

    const button = screen.getByLabelText("display more actions");
    await user.click(button);

    const expandAllItem = await screen.findByText("Expand All");
    await user.click(expandAllItem);

    await waitFor(() => {
      expect(screen.queryByText("Expand All")).not.toBeInTheDocument();
    });
  });
});
