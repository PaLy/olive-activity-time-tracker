import dayjs from "../../../utils/dayjs";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderApp } from "../../../utils/__testutils__/app";
import { userEvent } from "@testing-library/user-event";
import { activityItem } from "../../activityList/__testutils__/activityItemUtils";
import { setLocale } from "../../../utils/locale";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "../../../db/db";
import { Currency, SettingKey } from "../../../db/entities";

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
        start: +dayjs().endOf("day").subtract(30, "minutes"),
        end: +dayjs().endOf("day"),
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

  it("can hide the duration", async () => {
    await act(() => renderApp({ route: "/today/settings" }));
    const durationSwitch = await screen.findByRole("switch", {
      name: /Show duration/i,
    });
    expect(durationSwitch).toBeChecked();

    await userEvent.click(durationSwitch);

    await waitFor(() => expect(durationSwitch).not.toBeChecked());
    await waitFor(async () => {
      const setting = await db.settings.get({
        key: SettingKey.ACTIVITY_LIST,
      });
      expect(setting?.value.showDuration).toBe(false);
    });
  });

  it("validates the cost per hour", async () => {
    await act(() => renderApp({ route: "/today/settings" }));
    await userEvent.click(
      await screen.findByRole("switch", { name: /Show cost/i }),
    );

    const perHour = await screen.findByRole("textbox", { name: "Per hour" });
    fireEvent.change(perHour, { target: { value: "not a number" } });
    expect(await screen.findByText("Please set a number")).toBeVisible();

    fireEvent.change(perHour, { target: { value: "12.5" } });

    await waitFor(() => expect(perHour).toHaveValue("12.5"));
    expect(screen.queryByText("Please set a number")).not.toBeInTheDocument();
    await waitFor(async () => {
      const setting = await db.settings.get({
        key: SettingKey.ACTIVITY_LIST,
      });
      expect(setting?.value.showCost.perHour).toBe("12.5");
    });
  });

  it("can change the currency", async () => {
    await act(() => renderApp({ route: "/today/settings" }));
    await userEvent.click(
      await screen.findByRole("switch", { name: /Show cost/i }),
    );

    const [currencySelect] = await screen.findAllByRole("combobox");
    await userEvent.click(currencySelect);
    await userEvent.click(await screen.findByRole("option", { name: "USD" }));

    await waitFor(async () => {
      const setting = await db.settings.get({
        key: SettingKey.ACTIVITY_LIST,
      });
      expect(setting?.value.showCost.currency).toBe(Currency.USD);
    });
  });
});
