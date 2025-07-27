import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { exportDB, importDB } from "../../../db/exportImport";
import { db } from "../../../db/db";
import { Interval } from "../../../db/entities";

describe("Import", () => {
  it("should import all activities and intervals", async () => {
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    const activities = await db.activities.count();
    const intervals = await db.intervals.count();
    expect(activities).toBe(3);
    expect(intervals).toBe(3);
  });

  it("should import date-times", async () => {
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    const intervals = await db.intervals.toArray();
    expectInterval(intervals[0]).start.toEqual("2024-03-28T16:50:44.490Z");
    expectInterval(intervals[0]).end.toEqual("2024-03-28T16:51:01.176Z");
    expectInterval(intervals[1]).start.toEqual("2024-03-28T16:50:21.428Z");
    expectInterval(intervals[1]).end.toEqual("2024-03-28T16:50:42.508Z");
    expectInterval(intervals[2]).start.toEqual("2024-03-28T16:49:51.264Z");
    expectInterval(intervals[2]).end.toEqual("2024-03-28T16:51:01.176Z");
  });

  it("migrates v1 data to v2", async () => {
    const dbV1 = readExportedActivities("exported-activities.json");
    const dbV2 = readExportedActivities("exported-activities-v2.json");
    await importDB(dbV1);
    const json = await exportDB();
    const jsonText = await json.text();
    const dbV2text = await dbV2.text();
    expect(jsonText).toEqual(dbV2text);
  });
});

describe("Exported data", () => {
  it("should be the same after import and export again", async () => {
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    const json = await exportDB();
    const jsonText = await json.text();
    const exportedActivitiesText = await exportedActivities.text();
    expect(jsonText).toEqual(exportedActivitiesText);
  });
});

const expectInterval = (interval: Interval) => ({
  start: {
    toEqual: (isoDateTime: string) => expectEquals(interval.start, isoDateTime),
  },
  end: {
    toEqual: (isoDateTime: string) => expectEquals(interval.end, isoDateTime),
  },
});

const expectEquals = (dateTime: number, isoDateTime: string) =>
  expect(new Date(dateTime).toISOString()).toEqual(isoDateTime);

function readExportedActivities(fileName = "exported-activities-v2.json") {
  const filePath = path.join(__dirname, fileName);
  return new File([readFileSync(filePath)], fileName, {
    type: "application/json",
  });
}
