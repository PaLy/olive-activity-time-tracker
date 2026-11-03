import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "../../../utils/__testutils__/app";
import { db } from "../../../db/db";
import dayjs from "../../../utils/dayjs";
import {
  planUpdateInterval,
  updateInterval,
} from "../../../db/queries/editInterval";

vi.mock("../../../db/queries/editInterval", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../db/queries/editInterval")>();
  return {
    ...actual,
    planUpdateInterval: vi.fn(),
    updateInterval: vi.fn(),
  };
});

const start = +dayjs().subtract(2, "hour");
const end = +dayjs().subtract(1, "hour");

const seedInterval = async () => {
  await db.activities.add({
    name: "Test",
    parentId: -1,
    expanded: 0,
    notificationsEnabled: 1,
  });
  await db.intervals.add({ activityId: 1, start, end });
};

describe("EditInterval save errors", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await seedInterval();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an error when planning the update fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(planUpdateInterval).mockRejectedValueOnce(
      new Error("plan failed"),
    );

    renderApp({ route: "/activities/1/interval/1" });
    await userEvent.click(await screen.findByRole("button", { name: "Save" }));

    expect(await screen.findByText("Failed to update interval")).toBeVisible();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("shows an error when saving the update fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(planUpdateInterval).mockResolvedValueOnce({
      pieces: [],
      absorbedIds: [],
      ancestorChanges: [],
      changes: [],
    });
    vi.mocked(updateInterval).mockRejectedValueOnce(new Error("save failed"));

    renderApp({ route: "/activities/1/interval/1" });
    await userEvent.click(await screen.findByRole("button", { name: "Save" }));

    expect(await screen.findByText("Failed to update interval")).toBeVisible();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
