import moment from "moment/moment";
import { renderApp } from "../../../__testutils__/app";
import { userEvent } from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { storageModal } from "../__testutils__/storageModalTestUtils";
import path from "path";
import { describe, expect, it, vi } from "vitest";
import { db } from "../../../db/db";

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
      const exportMock = vi.fn();
      window.Android = { export: exportMock };
      Date.now = vi.fn(() => new Date("2024-03-05T08:20:37").getTime());

      renderApp({ route: "/today/storage" });
      await userEvent.click(
        await screen.findByRole("button", { name: /export/i }),
      );

      await waitFor(() =>
        expect(exportMock).toHaveBeenCalledWith(
          `{
  "formatName": "dexie",
  "formatVersion": 1,
  "data": {
    "databaseName": "Olive",
    "databaseVersion": 1,
    "tables": [
      {
        "name": "activities",
        "schema": "++id,name,parentId,expanded",
        "rowCount": 1
      },
      {
        "name": "intervals",
        "schema": "++id,activityId,start,end",
        "rowCount": 1
      },
      {
        "name": "settings",
        "schema": "key",
        "rowCount": 0
      }
    ],
    "data": [{
      "tableName": "activities",
      "inbound": true,
      "rows": [
        {
          "name": "Test",
          "parentId": -1,
          "expanded": 0,
          "id": 1,
          "$types": {
            "": "userObject"
          }
        }
      ]
    },{
      "tableName": "intervals",
      "inbound": true,
      "rows": [
        {
          "activityId": 1,
          "start": "2025-02-15T18:52:40.637Z",
          "end": "2025-02-15T18:57:40.637Z",
          "id": 1,
          "$types": {
            "": "userObject"
          }
        }
      ]
    },{
      "tableName": "settings",
      "inbound": true,
      "rows": []
    }]
  }
}`,
          "activities_202403050820.json",
        ),
      );
    });
  });
});

const prepareData = async () => {
  await db.activities.bulkAdd([{ name: "Test", parentId: -1, expanded: 0 }]);
  await db.intervals.bulkAdd([
    {
      activityId: 1,
      start: +moment("2025-02-15T18:52:40.637Z"),
      end: +moment("2025-02-15T18:57:40.637Z"),
    },
  ]);
};
