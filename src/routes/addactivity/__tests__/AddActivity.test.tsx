import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "../../../__testutils__/app";
import { describe, expect, it } from "vitest";
import { db } from "../../../db/db";

describe("AddActivityModal", () => {
  it("can add a new activity under an in-progress activity", async () => {
    renderApp();
    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );
    await userEvent.type(await screen.findByRole("textbox"), "Work");
    await userEvent.click(
      await screen.findByRole("button", { name: "finish" }),
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "new" }));
    await userEvent.type(await screen.findByRole("textbox"), "Code Review");
    await userEvent.click(await screen.findByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Work" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "finish" }),
    );

    expect(await screen.findByText("Work")).toBeVisible();
    expect(await screen.findByText("Code Review")).toBeVisible();
  });

  it("can start first activity", async () => {
    renderApp();
    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );
    await userEvent.type(await screen.findByRole("textbox"), "Work");
    await userEvent.click(
      await screen.findByRole("button", { name: "finish" }),
    );
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
    await userEvent.click(
      await screen.findByRole("button", { name: "finish" }),
    );

    await waitFor(async () =>
      expect(await screen.findByLabelText("stop activity")).toBeVisible(),
    );
  });
});
