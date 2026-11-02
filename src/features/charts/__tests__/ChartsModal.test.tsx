import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "../../../utils/__testutils__/app";
import { db } from "../../../db/db";
import dayjs from "../../../utils/dayjs";
import { ReactNode } from "react";
import { Activity } from "../../../db/entities";

// ResponsiveContainer measures its DOM node, which is always 0x0 in jsdom.
// Render the charts with a fixed size instead so Recharts does not warn.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ width: 400, height: 300 }}>{children}</div>
    ),
  };
});

const seedActivities = () =>
  db.activities.bulkAdd([
    { name: "Work", parentId: -1, expanded: 1, notificationsEnabled: 1 },
    { name: "Coding", parentId: 1, expanded: 0, notificationsEnabled: 1 },
    { name: "Personal", parentId: -1, expanded: 0, notificationsEnabled: 1 },
  ]);

describe("ChartsModal", () => {
  it("renders the charts for all activities", async () => {
    await seedActivities();
    const today = dayjs().startOf("day").add(9, "hour");
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: today.valueOf(),
        end: today.add(1, "hour").valueOf(),
      },
      {
        activityId: 2,
        start: today.add(1, "hour").valueOf(),
        end: today.add(2, "hour").valueOf(),
      },
      {
        activityId: 3,
        start: today.subtract(1, "day").valueOf(),
        end: today.subtract(1, "day").add(30, "minute").valueOf(),
      },
    ]);

    renderApp({ route: "/charts" });

    expect(await screen.findByText("Charts")).toBeVisible();
    expect(screen.getByRole("button", { name: "Week" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Month" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Year" })).toBeVisible();

    // The root activity is selected by default.
    expect(
      await screen.findByRole("combobox", { name: "Activity" }),
    ).toHaveValue("All activities");

    // Breakdown of the tracked time (1h + 1h + 0.5h).
    expect(await screen.findByText("Time per activity")).toBeVisible();
    expect(await screen.findByText("Total:")).toHaveTextContent("2h 30m");
    // "Work" also appears in the activity picker, so scope to the breakdown.
    const breakdown = screen.getByText("Time per activity").parentElement!;
    expect(within(breakdown).getByText("Work")).toBeVisible();
    expect(within(breakdown).getByText("Personal")).toBeVisible();
    // Descendants are included in their parent's duration.
    expect(within(breakdown).queryByText("Coding")).not.toBeInTheDocument();

    // The other charts are rendered as well.
    expect(screen.getByText("Time per day (hours)")).toBeVisible();
    expect(screen.getByText("When you track time")).toBeVisible();
    expect(screen.getByText("Session lengths")).toBeVisible();
    expect(screen.getByText("Switches per day")).toBeVisible();
    expect(
      screen.getByText(/Changes to another activity, last 30 days/),
    ).toBeVisible();
  });

  it("switches the period and the switch count granularity", async () => {
    await seedActivities();
    const today = dayjs().startOf("day").add(9, "hour");
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: today.valueOf(),
        end: today.add(1, "hour").valueOf(),
      },
      {
        activityId: 2,
        start: today.add(1, "hour").valueOf(),
        end: today.add(2, "hour").valueOf(),
      },
    ]);

    renderApp({ route: "/charts" });

    await userEvent.click(await screen.findByRole("button", { name: "Year" }));
    expect(await screen.findByText("Time per month (hours)")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(await screen.findByText("Time per day (hours)")).toBeVisible();

    await userEvent.click(
      await screen.findByRole("button", { name: "Months" }),
    );
    expect(await screen.findByText("Switches per month")).toBeVisible();
    expect(
      screen.getByText(/Changes to another activity, last 12 months/),
    ).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Years" }));
    expect(await screen.findByText("Switches per year")).toBeVisible();
    expect(
      screen.getByText(/Changes to another activity, all years/),
    ).toBeVisible();
  });

  it("filters the charts by the selected activity", async () => {
    await seedActivities();
    const today = dayjs().startOf("day").add(9, "hour");
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: today.valueOf(),
        end: today.add(1, "hour").valueOf(),
      },
      {
        activityId: 2,
        start: today.add(1, "hour").valueOf(),
        end: today.add(2, "hour").valueOf(),
      },
      {
        activityId: 3,
        start: today.add(2, "hour").valueOf(),
        end: today.add(3, "hour").valueOf(),
      },
    ]);

    renderApp({ route: "/charts" });

    await userEvent.click(
      await screen.findByRole("combobox", { name: "Activity" }),
    );
    await userEvent.click(await screen.findByRole("option", { name: "Work" }));

    await waitFor(async () => {
      expect(await screen.findByText("Total:")).toHaveTextContent("2h 0m");
    });
    expect(screen.queryByText("Personal")).not.toBeInTheDocument();
  });

  it("changes how sessions are merged", async () => {
    await seedActivities();
    const today = dayjs().startOf("day").add(9, "hour");
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: today.valueOf(),
        end: today.add(10, "minute").valueOf(),
      },
      {
        activityId: 1,
        start: today.add(20, "minute").valueOf(),
        end: today.add(40, "minute").valueOf(),
      },
    ]);

    renderApp({ route: "/charts" });

    const gapSelect = await screen.findByRole("combobox", {
      name: /Merge sessions separated by less than/,
    });
    expect(gapSelect).toHaveTextContent("1 min");

    await userEvent.click(gapSelect);
    await userEvent.click(
      await screen.findByRole("option", { name: "No gap" }),
    );

    expect(gapSelect).toHaveTextContent("No gap");
  });

  it("shows empty states when nothing was tracked", async () => {
    await seedActivities();

    renderApp({ route: "/charts" });

    expect(
      await screen.findByText("No tracked time in this period."),
    ).toBeVisible();
    expect(
      await screen.findByText("No sessions in this period."),
    ).toBeVisible();
    expect(await screen.findByText("No switches in this range.")).toBeVisible();
    await waitFor(() =>
      expect(
        screen.queryByText("Time per day (hours)"),
      ).not.toBeInTheDocument(),
    );
  });

  it("falls back to the first activity when the remembered one is gone", async () => {
    await seedActivities();
    const { useChartsStore } = await import("../Store");
    useChartsStore.getState().setActivityId(999);

    renderApp({ route: "/charts" });

    expect(
      await screen.findByRole("combobox", { name: "Activity" }),
    ).toHaveValue("All activities");
  });

  it("is not rendered outside the charts route", async () => {
    renderApp({ route: "/" });

    expect(await screen.findByText("No activities yet")).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Charts" }),
    ).not.toBeInTheDocument();
  });
});

describe("ChartsModal charts", () => {
  it("shows the activity legend with an Other bucket for many activities", async () => {
    const activities = Array.from(
      { length: 12 },
      (_, index) =>
        ({
          name: `Activity ${index + 1}`,
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        }) satisfies Partial<Activity>,
    );
    await db.activities.bulkAdd(activities);
    const today = dayjs().startOf("day").add(9, "hour");
    await db.intervals.bulkAdd(
      activities.map((_, index) => ({
        activityId: index + 1,
        start: today.add(index * 10, "minute").valueOf(),
        end: today.add(index * 10 + 5, "minute").valueOf(),
      })),
    );

    renderApp({ route: "/charts" });

    const chart = await screen.findByText("Time per day (hours)");
    expect(chart).toBeVisible();
    const legend = chart.parentElement!;
    expect(await within(legend).findByText("Other (2)")).toBeVisible();
    expect(within(legend).queryByText("Activity 12")).not.toBeInTheDocument();
  });
});
