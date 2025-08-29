import dayjs from "../../../utils/dayjs";
import { renderApp } from "../../../utils/__testutils__/app";
import { act, screen } from "@testing-library/react";
import {
  PointerEventsCheckLevel,
  userEvent,
} from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { db } from "../../../db/db";
import { MAX_DATE_MS } from "../../../utils/date";

describe("ActivityDetailsPage", () => {
  describe("after opened directly", () => {
    it("activity details", async () => {
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now(), end: MAX_DATE_MS },
        { activityId: 2, start: Date.now(), end: MAX_DATE_MS },
      ]);
      await act(() => renderApp({ route: "/activities/1" }));
      expect(await screen.findByText(/\(Child\)/)).toBeVisible();
    });

    it("allows to go back to the root route", async () => {
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 1, notificationsEnabled: 1 },
        { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now(), end: MAX_DATE_MS },
        { activityId: 2, start: Date.now(), end: MAX_DATE_MS },
      ]);
      await act(() => renderApp({ route: "/activities/1" }));
      await userEvent.click(
        await screen.findByRole("button", { name: "back" }),
      );
      expect(await screen.findByText("Parent")).toBeVisible();
    });
  });

  it("can delete an interval", async () => {
    await db.activities.bulkAdd([
      { name: "Test", parentId: -1, expanded: 0, notificationsEnabled: 1 },
    ]);
    await db.intervals.bulkAdd([
      { activityId: 1, start: Date.now(), end: MAX_DATE_MS },
    ]);
    renderApp();
    await userEvent.click(await screen.findByRole("link", { name: "T" }));
    await userEvent.click(
      await screen.findByRole("link", { name: "edit interval" }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "delete" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "yes" }));
    await userEvent.click(await screen.findByRole("button", { name: "back" }));
    expect(screen.queryByText("Test")).not.toBeInTheDocument();
  });

  // This test is skipped because time picking does not work (in test).
  it.skip("edits just the edited interval", async () => {
    await db.activities.bulkAdd([
      { name: "Test", parentId: -1, expanded: 0, notificationsEnabled: 1 },
    ]);
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: +dayjs().hour(8).startOf("hour"),
        end: +dayjs().hour(8).minute(30).startOf("minute"),
      },
      {
        activityId: 1,
        start: +dayjs().hour(10).startOf("hour"),
        end: +dayjs().hour(10).minute(30).startOf("minute"),
      },
    ]);
    renderApp();
    await userEvent.click(await screen.findByRole("link", { name: "T" }));

    const editIntervalButton = await screen.findAllByRole("link", {
      name: "edit interval",
    });
    await userEvent.click(editIntervalButton[0]); // the first interval is the latest (10:00)

    const timePickers = await screen.findAllByRole("textbox", {
      name: /choose date/i,
    });
    await userEvent.click(timePickers[0]);
    await userEvent.click(await screen.findByRole("button", { name: /10/ }));
    await userEvent.click(await screen.findByLabelText("9 hours"), {
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });
    await userEvent.click(await screen.findByRole("button", { name: /ok/i }));

    await userEvent.click(await screen.findByRole("button", { name: /save/i }));

    expect(await screen.findByText(/8:00/)).toBeVisible();
    expect(await screen.findByText(/8:30/)).toBeVisible();
    expect(await screen.findByText(/9:00/)).toBeVisible();
    expect(await screen.findByText(/10:30/)).toBeVisible();
  });

  it("can disable activity notifications", async () => {
    await db.activities.bulkAdd([
      {
        name: "Test Activity",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      },
    ]);
    await db.intervals.bulkAdd([
      { activityId: 1, start: Date.now(), end: MAX_DATE_MS },
    ]);

    // Navigate to activity details page
    await act(() => renderApp({ route: "/activities/1" }));

    // Click the settings button
    await userEvent.click(
      await screen.findByRole("button", { name: "Activity settings" }),
    );

    // Verify we're on the settings page
    expect(await screen.findByText("Activity Settings")).toBeVisible();

    // Find and verify the notification switch is currently enabled
    const notificationSwitch = await screen.findByRole("switch", {
      name: /Show notifications when this activity is in progress/i,
    });
    expect(notificationSwitch).toBeChecked();

    // Click to disable notifications
    await userEvent.click(notificationSwitch);

    // Verify success message appears
    expect(
      await screen.findByText("Notification settings updated"),
    ).toBeVisible();

    // Verify the switch is now unchecked
    expect(notificationSwitch).not.toBeChecked();

    // Verify the database was updated
    const updatedActivity = await act(() => db.activities.get(1));
    expect(updatedActivity?.notificationsEnabled).toBe(0);
  });
});
