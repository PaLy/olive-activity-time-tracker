import moment from "moment";
import { importActivities } from "../../../data/__testutils__/storageUtils";
import { activityItem } from "../__testutils__/activityItemUtils";
import { renderApp } from "../../../__testutils__/app";
import { screen, waitFor } from "@testing-library/react";
import { setExpanded } from "../../../data/activity/ActivityInListExpanded";

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
      await activityItem.userEvent.stop("1");
      await waitFor(async () =>
        expect(await activityItem.find.startButton("1")).toBeVisible(),
      );
    });

    it("is collapsed after parent was stopped", async () => {
      await importActivities([
        {
          id: "1",
          name: "Parent",
          intervals: [{ id: "1", start: moment() }],
        },
        {
          id: "2",
          name: "Child",
          parentID: "1",
          intervals: [{ id: "2", start: moment() }],
        },
      ]);
      await setExpanded("1", true);

      renderApp();
      await waitFor(async () =>
        expect(await screen.findByText("Child")).toBeVisible(),
      );
      await activityItem.userEvent.stop("1");
      await waitFor(() =>
        expect(screen.queryByText("Child")).not.toBeInTheDocument(),
      );
    });
  });

  describe("when the activity is not in progress", () => {
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
      await activityItem.userEvent.start("1");
      await waitFor(async () =>
        expect(await activityItem.find.stopButton("1")).toBeVisible(),
      );
    });

    it("is expanded after parent was started", async () => {
      await importActivities([
        {
          id: "1",
          name: "Parent",
          intervals: [
            { id: "1", start: moment().subtract(1, "hour"), end: moment() },
          ],
        },
        {
          id: "2",
          name: "Child",
          parentID: "1",
          intervals: [
            { id: "2", start: moment().subtract(1, "hour"), end: moment() },
          ],
        },
      ]);

      renderApp();
      expect(screen.queryByText("Child")).not.toBeInTheDocument();

      await activityItem.userEvent.start("1");
      await waitFor(async () =>
        expect(await screen.findByText("Child")).toBeVisible(),
      );
    });
  });
});
