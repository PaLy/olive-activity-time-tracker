import dayjs from "../../../../utils/dayjs";
import { renderApp } from "../../../../utils/__testutils__/app";
import { userEvent } from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { storageModal } from "../__testutils__/storageModalTestUtils";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "../../../../db/db";
import MockDate from "mockdate";

describe("StorageModal", () => {
  afterEach(() => {
    MockDate.reset();
  });

  describe("import", () => {
    it("clears the old data", async () => {
      await prepareData();
      MockDate.set(new Date("2025-02-15T18:58:40"));

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
      MockDate.set(new Date("2024-03-05T08:20:37"));

      renderApp({ route: "/storage" });
      await userEvent.click(
        await screen.findByRole("button", { name: /export/i }),
      );

      await waitFor(() =>
        expect(window.Android?.export).toHaveBeenCalledWith(
          `{
  "formatName": "dexie",
  "formatVersion": 1,
  "data": {
    "databaseName": "Olive",
    "databaseVersion": 2,
    "tables": [
      {
        "name": "activities",
        "schema": "++id,name,parentId,expanded,notificationsEnabled",
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
          "notificationsEnabled": 1,
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
  await db.activities.bulkAdd([
    { name: "Test", parentId: -1, expanded: 0, notificationsEnabled: 1 },
  ]);
  await db.intervals.bulkAdd([
    {
      activityId: 1,
      start: +dayjs("2025-02-15T18:52:40.637Z"),
      end: +dayjs("2025-02-15T18:57:40.637Z"),
    },
  ]);
};
