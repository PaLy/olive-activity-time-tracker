import { describe, expect, it, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "../../../../utils/__testutils__/app";
import { db } from "../../../../db/db";
import { clearDB } from "../../../../db/exportImport";

vi.mock("../../../../db/exportImport", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../db/exportImport")>();
  return { ...actual, clearDB: vi.fn().mockResolvedValue(undefined) };
});

const addActivity = () =>
  db.activities.add({
    name: "Test",
    parentId: -1,
    expanded: 0,
    notificationsEnabled: 1,
  });

describe("DeleteDataButton", () => {
  it("keeps the data when the deletion is cancelled", async () => {
    await addActivity();
    const { unmount } = renderApp({ route: "/storage" });

    await userEvent.click(
      await screen.findByRole("button", { name: /Delete data/i }),
    );
    expect(
      await screen.findByText(
        "Are you sure you want to delete all the data forever?",
      ),
    ).toBeVisible();

    await userEvent.click(await screen.findByRole("button", { name: "No" }));

    await waitFor(() =>
      expect(
        screen.queryByText(
          "Are you sure you want to delete all the data forever?",
        ),
      ).not.toBeInTheDocument(),
    );
    expect(await db.activities.count()).toBe(1);
    unmount();
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  });

  it("deletes all the data after confirmation", async () => {
    await addActivity();
    const { unmount } = renderApp();

    await userEvent.click(await screen.findByRole("button", { name: "menu" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Storage" }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /Delete data/i }),
    );
    await userEvent.click(await screen.findByRole("button", { name: "Yes" }));

    expect(await screen.findByText("Data successfully deleted")).toBeVisible();
    expect(clearDB).toHaveBeenCalledTimes(1);
    unmount();
    // Let the live queries settle after the database was cleared.
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  });
});
