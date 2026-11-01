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

  it("switches between the list intervals", async () => {
    renderApp();

    await userEvent.click(await screen.findByText("Day"));
    expect(await screen.findByText("Yesterday")).toBeVisible();

    await userEvent.click(await screen.findByText("Month"));
    expect(await screen.findByText(dayjs().format("MMMM YYYY"))).toBeVisible();

    await userEvent.click(await screen.findByText("Date Range"));
    expect(await screen.findByText("1 week")).toBeVisible();
  });
});
