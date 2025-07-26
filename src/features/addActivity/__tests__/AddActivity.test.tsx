import { act, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "../../../utils/__testutils__/app";
import { describe, expect, it } from "vitest";
import { db } from "../../../db/db";
import { MAX_DATE_MS } from "../../../utils/date";

describe("AddActivityModal", () => {
  it("can add a new activity under an in-progress activity", async () => {
    renderApp();
    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );
    await userEvent.type(await screen.findByRole("textbox"), "Work");
    await userEvent.click(await screen.findByRole("button", { name: "Start" }));

    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "new" }));
    await userEvent.type(await screen.findByRole("textbox"), "Code Review");
    await userEvent.click(await screen.findByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Work" }));
    await userEvent.click(await screen.findByRole("button", { name: "Start" }));

    expect(await screen.findByText("Work")).toBeVisible();
    expect(await screen.findByText("Code Review")).toBeVisible();
  });

  it("can start first activity", async () => {
    renderApp();
    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );
    await userEvent.type(await screen.findByRole("textbox"), "Work");
    await userEvent.click(await screen.findByRole("button", { name: "Start" }));
    await waitFor(async () =>
      expect(await screen.findByText("Work")).toBeVisible(),
    );
  });

  it("can start an existing activity", async () => {
    await db.activities.bulkAdd([{ name: "Work", parentId: -1, expanded: 1 }]);
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: new Date("2025-02-15T18:52:40.637Z").getTime(),
        end: new Date("2025-02-15T18:57:40.637Z").getTime(),
      },
    ]);
    renderApp();

    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );
    await userEvent.type(await screen.findByLabelText("Activity"), "Work");
    await userEvent.click(await screen.findByRole("option", { name: "Work" }));
    await userEvent.click(await screen.findByRole("button", { name: "Start" }));

    await waitFor(async () =>
      expect(await screen.findByLabelText("stop activity")).toBeVisible(),
    );
  });

  it("can add finished activity which is currently in progress", async () => {
    // Create an activity and start it (making it in progress)
    await db.activities.bulkAdd([{ name: "Work", parentId: -1, expanded: 1 }]);
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: new Date().getTime() - 1000 * 60 * 30, // started 30 minutes ago
        end: MAX_DATE_MS, // ongoing interval
      },
    ]);
    renderApp();

    // Open add activity modal
    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );

    // Switch to "Finished" interval toggle
    await userEvent.click(
      await screen.findByRole("button", { name: "Finished" }),
    );

    // Switch to existing activity tab
    await userEvent.click(
      await screen.findByRole("button", { name: "Existing" }),
    );

    // Type in the activity name to search for it
    await userEvent.type(await screen.findByLabelText("Activity"), "Work");

    // The "Work" option should be available even though it's in progress
    // because we're adding it as a finished activity
    await userEvent.click(await screen.findByRole("option", { name: "Work" }));

    // Save the finished activity
    await userEvent.click(await screen.findByRole("button", { name: "Save" }));

    await act(async () => {
      expect(await db.intervals.count()).toBe(2);
    });
  });
});
