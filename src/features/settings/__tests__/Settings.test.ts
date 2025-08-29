import moment from "moment";
import { act, screen } from "@testing-library/react";
import { renderApp } from "../../../utils/__testutils__/app";
import { userEvent } from "@testing-library/user-event";
import { activityItem } from "../../activityList/__testutils__/activityItemUtils";
import { setLocale } from "../../../utils/locale";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "../../../db/db";

describe("Settings", () => {
  beforeAll(() => {
    setLocale("en-US");
  });

  beforeEach(async () => {
    setLocale("en-US");
    await db.activities.bulkAdd([
      { name: "Work", parentId: -1, expanded: 0, notificationsEnabled: 1 },
    ]);
    await db.intervals.bulkAdd([
      {
        activityId: 1,
        start: +moment().endOf("day").subtract(30, "minutes"),
        end: +moment().endOf("day"),
      },
    ]);
  });

  it("can enable displaying cost", async () => {
    await act(() => renderApp({ route: "/today/settings" }));
    await userEvent.click(
      await screen.findByRole("switch", { name: /Show cost/i }),
    );
    await userEvent.click(await screen.findByRole("button", { name: /back/i }));

    expect(await activityItem.find.durationText()).toBe(
      "100 % • €5.0030 minutes",
    );
  });

  it("can show just duration", async () => {
    await act(() => renderApp({ route: "/today/settings" }));
    await userEvent.click(
      await screen.findByRole("switch", { name: /Show percentage/i }),
    );
    await userEvent.click(await screen.findByRole("button", { name: /back/i }));
    expect(await activityItem.find.durationText()).toBe("30 minutes");
  });
});
