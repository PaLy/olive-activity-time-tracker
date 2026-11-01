import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "../../../utils/__testutils__/app";
import { db } from "../../../db/db";
import dayjs from "../../../utils/dayjs";

const start = +dayjs().subtract(2, "hour");
const end = +dayjs().subtract(1, "hour");

describe("EditInterval", () => {
  beforeEach(() => {
    // React Router emits a one-time hydration fallback warning in tests.
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("moves an interval to another activity", async () => {
    await db.activities.bulkAdd([
      { name: "A", parentId: -1, expanded: 0, notificationsEnabled: 1 },
      { name: "B", parentId: -1, expanded: 0, notificationsEnabled: 1 },
    ]);
    await db.intervals.add({ activityId: 1, start, end });

    renderApp({ route: "/activities/1/interval/1" });

    await userEvent.click(
      await screen.findByRole("combobox", { name: "Move to" }),
    );
    await userEvent.click(await screen.findByRole("option", { name: "B" }));
    await userEvent.click(await screen.findByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Interval successfully changed"),
    ).toBeVisible();
    await waitFor(async () => {
      const interval = await db.intervals.get(1);
      expect(interval?.activityId).toBe(2);
    });
  });

  it("shows overlapping changes and saves after confirmation", async () => {
    await db.activities.bulkAdd([
      { name: "Parent", parentId: -1, expanded: 0, notificationsEnabled: 1 },
      { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
    ]);
    await db.intervals.bulkAdd([
      { activityId: 1, start, end },
      {
        activityId: 2,
        start: start + 20 * 60 * 1000,
        end: start + 40 * 60 * 1000,
      },
    ]);

    renderApp({ route: "/activities/1/interval/1" });

    await userEvent.click(await screen.findByRole("button", { name: "Save" }));
    expect(
      await screen.findByText("Overlapping intervals will change"),
    ).toBeVisible();

    await userEvent.click(
      await screen.findByRole("button", { name: /cancel/i }),
    );
    await waitFor(() =>
      expect(
        screen.queryByText("Overlapping intervals will change"),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(await screen.findByRole("button", { name: "Save" }));
    await userEvent.click(
      await screen.findByRole("button", { name: /confirm/i }),
    );

    expect(
      await screen.findByText("Interval successfully changed"),
    ).toBeVisible();
    await waitFor(async () => {
      const parentIntervals = await db.intervals
        .where("activityId")
        .equals(1)
        .toArray();
      expect(parentIntervals.map((i) => [i.start, i.end])).toEqual([
        [start, start + 20 * 60 * 1000],
        [start + 40 * 60 * 1000, end],
      ]);
    });
  });
});
