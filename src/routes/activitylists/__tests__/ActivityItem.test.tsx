import moment from "moment";
import { activityItem } from "../__testutils__/activityItemUtils";
import { renderApp } from "../../../__testutils__/app";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { db } from "../../../db/db";
import { MAX_DATE_MS } from "../../../utils/Date";

describe("ActivityItem", () => {
  describe("when the activity is in progress", () => {
    it("shows ticking duration", async () => {
      await db.activities.bulkAdd([
        { name: "Test", parentId: -1, expanded: 0 },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now(), end: MAX_DATE_MS },
      ]);

      renderApp();
      expect(await activityItem.find.tickingDurationText());
    });

    it("can be stopped", async () => {
      await db.activities.bulkAdd([
        { name: "Test", parentId: -1, expanded: 0 },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now(), end: MAX_DATE_MS },
      ]);

      renderApp();
      await activityItem.userEvent.stop(1);
      await waitFor(async () =>
        expect(await activityItem.find.startButton(1)).toBeVisible(),
      );
    });

    it("is collapsed after parent was stopped", async () => {
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 1 },
        { name: "Child", parentId: 1, expanded: 0 },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now(), end: MAX_DATE_MS },
        { activityId: 2, start: Date.now(), end: MAX_DATE_MS },
      ]);

      renderApp();
      await waitFor(async () =>
        expect(await screen.findByText("Child")).toBeVisible(),
      );
      await activityItem.userEvent.stop(1);
      await waitFor(() =>
        expect(screen.queryByText("Child")).not.toBeInTheDocument(),
      );
    });
  });

  describe("when the activity is not in progress", () => {
    it("can be started", async () => {
      await db.activities.bulkAdd([
        { name: "Test", parentId: -1, expanded: 0 },
      ]);
      await db.intervals.bulkAdd([
        {
          activityId: 1,
          start: +moment().subtract(1, "hour"),
          end: Date.now(),
        },
      ]);

      renderApp();
      await activityItem.userEvent.start(1);
      await waitFor(async () =>
        expect(await activityItem.find.stopButton(1)).toBeVisible(),
      );
    });

    it("is expanded after parent was started", async () => {
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 1 },
        { name: "Child", parentId: 1, expanded: 0 },
      ]);
      await db.intervals.bulkAdd([
        {
          activityId: 1,
          start: +moment().subtract(1, "hour"),
          end: Date.now(),
        },
        {
          activityId: 2,
          start: +moment().subtract(1, "hour"),
          end: Date.now(),
        },
      ]);

      renderApp();
      expect(screen.queryByText("Child")).not.toBeInTheDocument();

      await activityItem.userEvent.start(1);
      await waitFor(async () =>
        expect(await screen.findByText("Child")).toBeVisible(),
      );
    });
  });
});
