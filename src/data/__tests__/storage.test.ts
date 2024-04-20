import { exportDB, importDB } from "../Storage";
import { readFileSync } from "fs";
import path from "path";
import moment, { Moment } from "moment";
import { activityStore } from "../activity/Storage";
import { intervalStore } from "../interval/Storage";
import { Interval } from "../interval/Interval";

describe("Import", () => {
  it("should import all activities and intervals", async () => {
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    const activities = await activityStore.load();
    const intervals = await intervalStore.load();
    expect(activities.size).toBe(4);
    expect(intervals.size).toBe(3);
  });

  it("should import date-times", async () => {
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    const intervals = await intervalStore.load();
    expectInterval("44MslacRm1wErm1uiCHzH", intervals).start.toEqual(
      "2024-03-28T16:50:44.490Z",
    );
    expectInterval("44MslacRm1wErm1uiCHzH", intervals).end.toEqual(
      "2024-03-28T16:51:01.176Z",
    );
    expectInterval("OQomPEA8RV-KXCigrANWf", intervals).start.toEqual(
      "2024-03-28T16:50:21.428Z",
    );
    expectInterval("OQomPEA8RV-KXCigrANWf", intervals).end.toEqual(
      "2024-03-28T16:50:42.508Z",
    );
    expectInterval("Z9uQ06YjeJ6GHuOkDJQzD", intervals).start.toEqual(
      "2024-03-28T16:49:51.264Z",
    );
    expectInterval("Z9uQ06YjeJ6GHuOkDJQzD", intervals).end.toEqual(
      "2024-03-28T16:51:01.176Z",
    );
  });
});

describe("Exported data", () => {
  it("should be the same after import and export again", async () => {
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    const json = await exportDB();
    expect(json).toEqual(exportedActivities);
  });
});

const expectInterval = (
  intervalID: string,
  intervals: Map<string, Interval>,
) => ({
  start: {
    toEqual: (isoDateTime: string) =>
      expectEquals(intervals.get(intervalID)?.start, isoDateTime),
  },
  end: {
    toEqual: (isoDateTime: string) =>
      expectEquals(intervals.get(intervalID)?.end, isoDateTime),
  },
});

const expectEquals = (
  dateTime: Moment | null | undefined,
  isoDateTime: string,
) => expect(dateTime?.valueOf()).toEqual(moment(isoDateTime).valueOf());

function readExportedActivities() {
  return readFileSync(
    path.join(__dirname, "exported-activities.json"),
  ).toString();
}
