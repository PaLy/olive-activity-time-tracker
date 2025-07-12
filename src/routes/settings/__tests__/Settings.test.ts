import { importActivities } from "../../../data/__testutils__/storageUtils";
import moment from "moment";
import { act, screen } from "@testing-library/react";
import { element, renderApp } from "../../../__testutils__/app";
import { userEvent } from "@testing-library/user-event";
import { activityItem } from "../../activitylists/__testutils__/activityItemUtils";
import { setLocale } from "../../../utils/Locale";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("Settings", () => {
  beforeAll(() => {
    setLocale("en-US");
  });

  beforeEach(async () => {
    setLocale("en-US");
    await importActivities([
      {
        id: "1",
        name: "Work",
        intervals: [
          { id: "1", start: moment().subtract(30, "minutes"), end: moment() },
        ],
      },
    ]);
  });

  it("can enable displaying cost", async () => {
    await act(() => renderApp({ route: "/today/settings" }));
    await userEvent.click(await element.find.switch(/Show cost/i));
    await userEvent.click(await screen.findByRole("button", { name: /back/i }));

    expect(await activityItem.find.durationText()).toBe(
      "100 % • €5.0030 minutes",
    );
  });

  it("can show just duration", async () => {
    await act(() => renderApp({ route: "/today/settings" }));
    await userEvent.click(await element.find.switch(/Show percentage/i));
    await userEvent.click(await screen.findByRole("button", { name: /back/i }));

    expect(await activityItem.find.durationText()).toBe("30 minutes");
  });
});
