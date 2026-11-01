import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { IntervalItem } from "../IntervalItem";
import { Activity, Interval } from "../../../db/entities";
import { MAX_DATE_MS } from "../../../utils/date";
import dayjs from "../../../utils/dayjs";

const activities = new Map<number, Activity>([
  [
    1,
    {
      id: 1,
      name: "Parent",
      parentId: -1,
      expanded: 1,
      notificationsEnabled: 1,
    } as unknown as Activity,
  ],
  [
    2,
    {
      id: 2,
      name: "Child",
      parentId: 1,
      expanded: 0,
      notificationsEnabled: 1,
    } as unknown as Activity,
  ],
]);

const renderItem = (interval: Interval, activityId = interval.activityId) =>
  render(
    <MemoryRouter>
      <IntervalItem
        activityId={activityId}
        interval={interval}
        activities={activities}
      />
    </MemoryRouter>,
  );

describe("IntervalItem", () => {
  it("shows an interval that ended on the same day", () => {
    renderItem({
      id: 1,
      activityId: 1,
      start: +dayjs("2024-01-15T10:00:00"),
      end: +dayjs("2024-01-15T11:30:00"),
    } as unknown as Interval);

    expect(screen.getByText(/10:00:00 — 11:30:00/)).toBeVisible();
    expect(screen.getByRole("link", { name: "edit interval" })).toHaveAttribute(
      "href",
      "/interval/1",
    );
  });

  it("shows the date for an interval that ended on another day", () => {
    renderItem({
      id: 2,
      activityId: 1,
      start: +dayjs("2024-01-15T23:00:00"),
      end: +dayjs("2024-01-16T01:00:00"),
    } as unknown as Interval);

    expect(screen.getByText(/Tue, Jan 16, 2024 01:00/)).toBeVisible();
  });

  it("shows an in-progress interval as ending now", () => {
    renderItem({
      id: 3,
      activityId: 1,
      start: +dayjs("2024-01-15T10:00:00"),
      end: MAX_DATE_MS,
    } as unknown as Interval);

    expect(screen.getByText(/— now/)).toBeVisible();
  });

  it("shows the path of a sub-activity", () => {
    renderItem(
      {
        id: 4,
        activityId: 2,
        start: +dayjs("2024-01-15T10:00:00"),
        end: +dayjs("2024-01-15T11:00:00"),
      } as unknown as Interval,
      1,
    );

    expect(screen.getByText(/\(Child\)/)).toBeVisible();
  });
});
