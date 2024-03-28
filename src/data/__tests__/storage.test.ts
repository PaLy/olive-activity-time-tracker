import { exportDB, importDB, waitForDBLoaded } from "../Storage";
import { readFileSync } from "fs";
import path from "path";
import { activities } from "../activity/Signals";
import { intervals } from "../interval/Signals";
import moment, { Moment } from "moment";

describe("Import", () => {
  it("should import all activities and intervals", async () => {
    await waitForDBLoaded();
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    expect(activities.value.size).toBe(4);
    expect(intervals.value.size).toBe(3);
  });

  it("should import date-times", async () => {
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    expectInterval("44MslacRm1wErm1uiCHzH").start.toEqual(
      "2024-03-28T16:50:44.490Z",
    );
    expectInterval("44MslacRm1wErm1uiCHzH").end.toEqual(
      "2024-03-28T16:51:01.176Z",
    );
    expectInterval("OQomPEA8RV-KXCigrANWf").start.toEqual(
      "2024-03-28T16:50:21.428Z",
    );
    expectInterval("OQomPEA8RV-KXCigrANWf").end.toEqual(
      "2024-03-28T16:50:42.508Z",
    );
    expectInterval("Z9uQ06YjeJ6GHuOkDJQzD").start.toEqual(
      "2024-03-28T16:49:51.264Z",
    );
    expectInterval("Z9uQ06YjeJ6GHuOkDJQzD").end.toEqual(
      "2024-03-28T16:51:01.176Z",
    );
  });
});

describe("Exported data", () => {
  it("should be the same after import and export again", async () => {
    await waitForDBLoaded();
    const exportedActivities = readExportedActivities();
    await importDB(exportedActivities);
    const json = await exportDB();
    expect(json).toEqual(exportedActivities);
  });
});

const expectInterval = (intervalID: string) => ({
  start: {
    toEqual: (isoDateTime: string) =>
      expectEquals(
        intervals.value.get(intervalID)?.value.start.value,
        isoDateTime,
      ),
  },
  end: {
    toEqual: (isoDateTime: string) =>
      expectEquals(
        intervals.value.get(intervalID)?.value.end.value,
        isoDateTime,
      ),
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
