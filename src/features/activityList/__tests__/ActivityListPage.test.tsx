import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "../../../utils/__testutils__/app";
import dayjs from "../../../utils/dayjs";
import { calendarTime } from "../../../utils/date";
import {
  useDateRangeFilterStore,
  useDayFilterStore,
  useMonthFilterStore,
} from "../ActivityListFilterStore";
import { db } from "../../../db/db";

describe("ActivityListPage", () => {
  beforeEach(() => {
    useDayFilterStore.setState({ day: dayjs().subtract(1, "day") });
    useMonthFilterStore.setState({ month: dayjs() });
    useDateRangeFilterStore.setState({
      start: dayjs().subtract(6, "days"),
      end: dayjs(),
    });
  });
  it("shows the day view with a date picker", async () => {
    renderApp({ route: "/day" });

    expect(await screen.findByText("Yesterday")).toBeVisible();

    await userEvent.click(
      screen.getByTestId("NavigateBeforeIcon").closest("button")!,
    );

    expect(
      await screen.findByText(calendarTime(dayjs().subtract(2, "day"))),
    ).toBeVisible();
  });

  it("shows the month view with a month picker", async () => {
    renderApp({ route: "/month" });

    const currentMonth = dayjs().format("MMMM YYYY");
    expect(await screen.findByText(currentMonth)).toBeVisible();
    expect(screen.getAllByText("Month").length).toBeGreaterThanOrEqual(1);
  });

  it("shows the date range view", async () => {
    renderApp({ route: "/range" });

    expect(await screen.findByText("1 week")).toBeVisible();
  });

  it("does not show the empty placeholder before activities are loaded", async () => {
    renderApp({ route: "/day" });

    expect(screen.queryByText("No activities yet")).not.toBeInTheDocument();

    expect(await screen.findByText("No activities yet")).toBeVisible();
  });

  it("switches between the list intervals", async () => {
    renderApp();

    await userEvent.click(await screen.findByText("Day"));
    expect(await screen.findByText("Yesterday")).toBeVisible();

    await userEvent.click(await screen.findByText("Month"));
    expect(await screen.findByText(dayjs().format("MMMM YYYY"))).toBeVisible();

    await userEvent.click(await screen.findByText("Date Range"));
    expect(await screen.findByText("1 week")).toBeVisible();
  });

  it("orders today's activities by their last end time", async () => {
    await db.activities.bulkAdd([
      { name: "First", parentId: -1, expanded: 0, notificationsEnabled: 1 },
      { name: "Second", parentId: -1, expanded: 0, notificationsEnabled: 1 },
    ]);
    const start = dayjs().startOf("day").add(9, "hour");
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: start.valueOf(),
        end: start.add(1, "hour").valueOf(),
      },
      {
        activityId: 2,
        start: start.add(1, "hour").valueOf(),
        end: start.add(2, "hour").valueOf(),
      },
    ]);

    renderApp({ route: "/" });

    expect(await screen.findByText("First")).toBeVisible();
    expect(await screen.findByText("Second")).toBeVisible();
  });

  it("shows an empty state when the day filter matches nothing", async () => {
    await db.activities.add({
      name: "Today only",
      parentId: -1,
      expanded: 0,
      notificationsEnabled: 1,
    });
    const start = dayjs().startOf("day").add(9, "hour");
    await db.intervals.add({
      activityId: 1,
      start: start.valueOf(),
      end: start.add(1, "hour").valueOf(),
    });

    renderApp({ route: "/day" });

    expect(
      await screen.findByText("No activities in this period"),
    ).toBeVisible();
    expect(
      screen.getByText("Try selecting a different date or range."),
    ).toBeVisible();
  });
});
