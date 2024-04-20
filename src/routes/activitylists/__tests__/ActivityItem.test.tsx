import moment from "moment";
import { importActivities } from "../../../data/__testutils__/storageUtils";
import { activityItem } from "../__testutils__/activityItemUtils";
import { renderApp } from "../../../__testutils__/app";
import { waitFor } from "@testing-library/react";

describe("ActivityItem", () => {
  describe("when the activity is in progress", () => {
    it("shows ticking duration", async () => {
      await importActivities([
        {
          id: "1",
          name: "Test",
          intervals: [{ id: "1", start: moment() }],
        },
      ]);

      renderApp();
      expect(await activityItem.find.tickingDurationText());
    });

    it("can be stopped", async () => {
      await importActivities([
        {
          id: "1",
          name: "Test",
          intervals: [{ id: "1", start: moment() }],
        },
      ]);

      renderApp();
      await activityItem.userEvent.stop();
      await waitFor(async () =>
        expect(await activityItem.find.startButton()).toBeVisible(),
      );
    });

    it("can be started", async () => {
      await importActivities([
        {
          id: "1",
          name: "Test",
          intervals: [
            { id: "1", start: moment().subtract(1, "hour"), end: moment() },
          ],
        },
      ]);

      renderApp();
      await activityItem.userEvent.start();
      await waitFor(async () =>
        expect(await activityItem.find.stopButton()).toBeVisible(),
      );
    });
  });
});
