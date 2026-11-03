import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { IntervalChangesDialog } from "../IntervalChangesDialog";

vi.mock("@mui/material/Dialog", async () => {
  const React = await import("react");
  return {
    default: ({
      open,
      children,
    }: {
      open?: boolean;
      children?: React.ReactNode;
    }) =>
      open ? React.createElement("div", { role: "dialog" }, children) : null,
  };
});

// ButtonBase's ripple schedules state updates outside of act, which would fail
// the test run because console.error is treated as a test failure.
vi.mock("@mui/material/Button", async () => {
  const React = await import("react");
  return {
    default: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
      React.createElement("button", props, children),
  };
});
import { IntervalChange } from "../../db/queries/intervalOverlaps";
import { MAX_DATE_MS } from "../../utils/date";

const change = (overrides: Partial<IntervalChange>): IntervalChange => ({
  activityId: 1,
  activityFullName: "Work",
  isModified: false,
  before: { start: 1000, end: 2000 },
  after: [{ start: 1000, end: 1500 }],
  ...overrides,
});

const renderDialog = (changes: IntervalChange[] | undefined) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <IntervalChangesDialog
      changes={changes}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel };
};

describe("IntervalChangesDialog", () => {
  it("does not show anything without changes", () => {
    renderDialog(undefined);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("describes all kinds of interval changes", () => {
    renderDialog([
      change({ merged: true }),
      change({ after: [] }),
      change({ after: [{ start: 1000, end: 1500 }] }),
      change({
        after: [
          { start: 500, end: 1000 },
          { start: 2000, end: 2500 },
        ],
      }),
    ]);

    expect(screen.getByText("Merged into the new interval")).toBeVisible();
    expect(screen.getByText("Removed entirely")).toBeVisible();
    expect(screen.getByText("Shortened")).toBeVisible();
    expect(screen.getByText("Split into 2 parts")).toBeVisible();
    expect(screen.getByText("Overlapping intervals will change")).toBeVisible();
    expect(screen.getByRole("button", { name: "confirm" })).toBeVisible();
  });

  it("shows the affected ranges and overlapping intervals", () => {
    renderDialog([
      change({
        before: { start: 1000, end: MAX_DATE_MS },
        overlapping: [
          { activityFullName: "Child", range: { start: 2000, end: 3000 } },
        ],
      }),
    ]);

    expect(screen.getByText(/– now/)).toBeVisible();
    expect(screen.getByText(/Overlaps Child:/)).toBeVisible();
  });

  it("blocks saving when the edited interval would be removed", async () => {
    const { onConfirm } = renderDialog([
      change({ isModified: true, after: [] }),
    ]);

    expect(screen.getByText("Interval cannot be saved")).toBeVisible();
    expect(screen.getByText(/fully covered by other intervals/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "cancel" })).toHaveTextContent(
      "Close",
    );
    expect(
      screen.queryByRole("button", { name: "confirm" }),
    ).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirms and cancels the changes", async () => {
    const { onConfirm, onCancel } = renderDialog([change({})]);

    fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "cancel" }));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
