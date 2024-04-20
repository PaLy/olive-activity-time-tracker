import { render } from "@testing-library/react";
import { RouterProvider } from "react-router-dom";
import { router } from "../../../router";
import moment from "moment";
import { importActivities } from "../../../data/__testutils__/storageUtils";
import { activityItemUtils } from "../__testutils__/activityItemUtils";

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

      render(<RouterProvider router={router}></RouterProvider>);

      expect(await activityItemUtils.find.tickingDurationText());
    });
  });
});
