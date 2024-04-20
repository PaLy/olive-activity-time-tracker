import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { activityStore } from "../../../data/activity/Storage";
import { renderApp } from "../../../__testutils__/app";

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
});
