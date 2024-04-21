import { importActivities } from "../../../data/__testutils__/storageUtils";
import moment from "moment/moment";
import { renderApp } from "../../../__testutils__/app";
import { act, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("ActivityRoute", () => {
  describe("after opened directly", () => {
    it("activity details", async () => {
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

    it("allows to go back to the root route", async () => {
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
      await userEvent.click(
        await screen.findByRole("button", { name: "back" }),
      );
      expect(await screen.findByText("Parent")).toBeVisible();
    });
  });

  it("can delete an interval", async () => {
    await importActivities([
      {
        id: "1",
        name: "Test",
        intervals: [{ id: "1", start: moment() }],
      },
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
});
