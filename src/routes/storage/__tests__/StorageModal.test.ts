import { importActivities } from "../../../data/__testutils__/storageUtils";
import moment from "moment/moment";
import { renderApp } from "../../../__testutils__/app";
import { userEvent } from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { storageModal } from "../__testutils__/storageModalTestUtils";
import path from "path";
import { expect, vi, it, describe } from "vitest";

describe("StorageModal", () => {
  describe("import", () => {
    it("clears the old data", async () => {
      await prepareData();
      Date.now = vi.fn(() => new Date("2025-02-15T18:58:40").getTime());

      renderApp();
      await waitFor(async () =>
        expect(await screen.findByText("Test")).toBeVisible(),
      );

      await userEvent.click(
        await screen.findByRole("button", { name: "menu" }),
      );
      await userEvent.click(
        await screen.findByRole("button", { name: "Storage" }),
      );
      await storageModal.userEvent.importFile(
        path.join(__dirname, "exported-activities.json"),
      );
      await userEvent.click(
        await screen.findByRole("button", { name: "back" }),
      );
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });
  });

  describe("export", () => {
    it("opens Android share dialog", async () => {
      await prepareData();
      window.Android = {
        export: vi.fn(),
      };
      Date.now = vi.fn(() => new Date("2024-03-05T08:20:37").getTime());

      renderApp({ route: "/today/storage" });
      await userEvent.click(
        await screen.findByRole("button", { name: /export/i }),
      );

      expect(window.Android.export).toHaveBeenCalledWith(
        `{
  "activities": [
    {
      "id": "1",
      "name": "Test",
      "intervalIDs": [
        "1"
      ],
      "parentID": "root",
      "childIDs": []
    }
  ],
  "intervals": [
    {
      "id": "1",
      "start": "2025-02-15T18:52:40.637Z",
      "end": "2025-02-15T18:57:40.637Z"
    }
  ],
  "activityInListExpanded": [],
  "settings": {
    "activityList": {
      "showPercentage": true,
      "showCost": {
        "show": false,
        "perHour": "10",
        "currency": "EUR"
      },
      "showDuration": true
    }
  }
}`,
        "activities_202403050820.json",
      );
    });
  });
});

const prepareData = async () => {
  await importActivities([
    {
      id: "1",
      name: "Test",
      intervals: [
        {
          id: "1",
          start: moment("2025-02-15T18:52:40.637Z"),
          end: moment("2025-02-15T18:57:40.637Z"),
        },
      ],
    },
  ]);
};
