import { importActivities } from "../../../data/__testutils__/storageUtils";
import moment from "moment/moment";
import { renderApp } from "../../../__testutils__/app";
import { act, screen } from "@testing-library/react";

describe("ActivityRoute", () => {
  it("can be opened directly", async () => {
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
    await act(() => renderApp({ route: "/activities/1" }));
    expect(await screen.findByText(/\(Child\)/)).toBeVisible();
  });
});
