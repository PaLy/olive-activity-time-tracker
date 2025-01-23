import { importActivities } from "../../../data/__testutils__/storageUtils";
import moment from "moment/moment";
import { renderApp } from "../../../__testutils__/app";
import { act, screen } from "@testing-library/react";
import {
  PointerEventsCheckLevel,
  userEvent,
} from "@testing-library/user-event";

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

  // This test is skipped because time picking does not work (in test).
  it.skip("edits just the edited interval", async () => {
    await importActivities([
      {
        id: "1",
        name: "Test",
        intervals: [
          {
            id: "1",
            start: moment("2025-01-23 08:00:00"),
            end: moment("2025-01-23 08:30:00"),
          },
          {
            id: "2",
            start: moment("2025-01-23 10:00:00"),
            end: moment("2025-01-23 10:30:00"),
          },
        ],
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
});
