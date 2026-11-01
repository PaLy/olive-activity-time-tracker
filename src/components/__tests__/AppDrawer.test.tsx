import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "../../utils/__testutils__/app";

describe("AppDrawer", () => {
  it("shows the drawer navigation", async () => {
    renderApp({ route: "/today/drawer" });

    expect(
      await screen.findByText("Olive: Activity Time Tracker"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Charts" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Settings" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Storage" })).toBeVisible();
  });

  it("opens settings and closes the drawer", async () => {
    renderApp({ route: "/today/drawer" });

    await userEvent.click(
      await screen.findByRole("button", { name: "Settings" }),
    );

    expect(
      await screen.findByRole("switch", { name: /Show percentage/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Activity list")).toBeVisible();
  });

  it("closes when clicking the drawer content", async () => {
    renderApp({ route: "/today/drawer" });

    await userEvent.click(
      await screen.findByText("Olive: Activity Time Tracker"),
    );

    expect(await screen.findByText("No activities yet")).toBeVisible();
  });

  it("opens storage", async () => {
    renderApp({ route: "/today/drawer" });

    await userEvent.click(
      await screen.findByRole("button", { name: "Storage" }),
    );

    expect(await screen.findByText(/All the data is stored/i)).toBeVisible();
  });

  it("closes on Escape", async () => {
    renderApp({ route: "/today/drawer" });

    await userEvent.keyboard("{Escape}");

    expect(await screen.findByText("No activities yet")).toBeVisible();
  });

  it("closes on a key press inside the drawer", async () => {
    renderApp({ route: "/today/drawer" });

    fireEvent.keyDown(await screen.findByText("Olive: Activity Time Tracker"), {
      key: "Enter",
    });

    expect(await screen.findByText("No activities yet")).toBeVisible();
  });

  it("resets the drawer after a touch cancel", async () => {
    renderApp({ route: "/today/drawer" });
    expect(
      await screen.findByText("Olive: Activity Time Tracker"),
    ).toBeVisible();

    fireEvent(document, new Event("touchcancel"));

    expect(
      await screen.findByText("Olive: Activity Time Tracker"),
    ).toBeVisible();
  });
});
