import { describe, expect, it } from "vitest";
import { db } from "../../db";
import { MAX_DATE_MS } from "../../../utils/date";
import { stopActivity } from "../stopActivity";

describe("stopActivity", () => {
  it("stops activity and its descendants", async () => {
    // Setup test data: parent with child, both in progress
    await db.activities.bulkAdd([
      { name: "Parent", parentId: -1, expanded: 1, notificationsEnabled: 1 },
      { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
    ]);
    await db.intervals.bulkAdd([
      { activityId: 1, start: Date.now() - 2000, end: MAX_DATE_MS }, // parent in progress
      { activityId: 2, start: Date.now() - 1000, end: MAX_DATE_MS }, // child in progress
    ]);

    const stopTime = Date.now();

    await stopActivity({ activityId: 1, end: stopTime });

    // Check that both intervals are stopped
    const parentInterval = await db.intervals.get(1);
    const childInterval = await db.intervals.get(2);

    expect(parentInterval?.end).toBe(stopTime);
    expect(childInterval?.end).toBe(stopTime);

    // Check that parent activity is collapsed
    const parentActivity = await db.activities.get(1);
    expect(parentActivity?.expanded).toBe(0);
  });

  it("resumes parent activity when stopping child activity", async () => {
    // Setup test data: parent and child, only child in progress
    await db.activities.bulkAdd([
      { name: "Parent", parentId: -1, expanded: 1, notificationsEnabled: 1 },
      { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
    ]);
    await db.intervals.bulkAdd([
      { activityId: 2, start: Date.now() - 1000, end: MAX_DATE_MS }, // child in progress
    ]);

    const stopTime = Date.now();

    await stopActivity({ activityId: 2, end: stopTime });

    // Check that child interval is stopped
    const childInterval = await db.intervals.get(1);
    expect(childInterval?.end).toBe(stopTime);

    // Check that parent activity is resumed (new interval created)
    const intervals = await db.intervals
      .where("activityId")
      .equals(1)
      .toArray();
    expect(intervals).toHaveLength(1);
    expect(intervals[0].start).toBe(stopTime);
    expect(intervals[0].end).toBe(MAX_DATE_MS);
  });

  it("does not resume parent when stopping root activity", async () => {
    // Setup test data: root activity in progress
    await db.activities.add({
      name: "Root",
      parentId: -1,
      expanded: 1,
      notificationsEnabled: 1,
    });
    await db.intervals.add({
      activityId: 1,
      start: Date.now() - 2000,
      end: MAX_DATE_MS,
    });

    const stopTime = Date.now();

    await stopActivity({ activityId: 1, end: stopTime });

    // Check that interval is stopped
    const interval = await db.intervals.get(1);
    expect(interval?.end).toBe(stopTime);

    // Check that no new interval is created for the root activity
    const intervals = await db.intervals
      .where("activityId")
      .equals(1)
      .toArray();
    expect(intervals).toHaveLength(1); // Only the stopped one
  });

  it("throws error when activity does not exist", async () => {
    await expect(
      stopActivity({ activityId: 999, end: Date.now() }),
    ).rejects.toThrow("Activity with ID 999 does not exist.");
  });
});
