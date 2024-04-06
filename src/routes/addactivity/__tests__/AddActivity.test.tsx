import { render, screen } from "@testing-library/react";
import { RouterProvider } from "react-router-dom";
import { router } from "../../../router";
import { userEvent } from "@testing-library/user-event";

describe("AddActivityModal", () => {
  it("can add a new activity under an in-progress activity", async () => {
    render(<RouterProvider router={router}></RouterProvider>);
    await userEvent.click(
      await screen.findByRole("button", { name: "start new activity" }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "new" }));
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
});
