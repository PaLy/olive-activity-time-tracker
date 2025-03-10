import { importActivities } from "../../../data/__testutils__/storageUtils";
import moment from "moment";
import { act, screen } from "@testing-library/react";
import { element, renderApp } from "../../../__testutils__/app";
import { userEvent } from "@testing-library/user-event";
import { activityItem } from "../../activitylists/__testutils__/activityItemUtils";

describe("Settings", () => {
  it("can enable displaying cost", async () => {
    await importActivities([
      {
        id: "1",
        name: "Work",
        intervals: [
          { id: "1", start: moment().subtract(30, "minutes"), end: moment() },
        ],
      },
    ]);
    await act(() => renderApp({ route: "/today/settings" }));

    await userEvent.click(await element.find.switch(/Show cost/i));
    await userEvent.click(await screen.findByRole("button", { name: /back/i }));

    expect(await activityItem.find.durationText()).toBe(
      "100 % • €5.00 30 minutes",
    );
  });
});
