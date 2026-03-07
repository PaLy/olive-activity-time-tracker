import { describe, expect, it } from "vitest";
import { db } from "../../db";
import { MAX_DATE_MS } from "../../../utils/date";
import { resumeActivity } from "../resumeActivity";

describe("resumeActivity", () => {
  it("creates new interval and stops ancestors when activity is not in progress", async () => {
    // Setup test data: parent and child, neither in progress
    await db.activities.bulkAdd([
      { name: "Parent", parentId: -1, expanded: 0, notificationsEnabled: 1 },
      { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
    ]);

    const resumeTime = Date.now();

    await resumeActivity({ activityId: 2, startTime: resumeTime });

    // Check that child has a new in-progress interval
    const childIntervals = await db.intervals
      .where("activityId")
      .equals(2)
      .toArray();
    expect(childIntervals).toHaveLength(1);
    expect(childIntervals[0].start).toBe(resumeTime);
    expect(childIntervals[0].end).toBe(MAX_DATE_MS);

    // Check that child activity is expanded
    const childActivity = await db.activities.get(2);
    expect(childActivity?.expanded).toBe(1);
  });

  it("does nothing when activity is already in progress", async () => {
    // Setup test data: activity already in progress
    await db.activities.add({
      name: "Activity",
      parentId: -1,
      expanded: 1,
      notificationsEnabled: 1,
    });
    await db.intervals.add({
      activityId: 1,
      start: Date.now() - 1000,
      end: MAX_DATE_MS,
    });

    const initialIntervals = await db.intervals.toArray();
    const initialActivities = await db.activities.toArray();

    const resumeTime = Date.now();

    await resumeActivity({ activityId: 1, startTime: resumeTime });

    // Check that nothing changed
    const finalIntervals = await db.intervals.toArray();
    const finalActivities = await db.activities.toArray();

    expect(finalIntervals).toEqual(initialIntervals);
    expect(finalActivities).toEqual(initialActivities);
  });

  it("stops ancestors when resuming a child activity", async () => {
    // Setup test data: parent in progress, child not in progress
    await db.activities.bulkAdd([
      { name: "Parent", parentId: -1, expanded: 1, notificationsEnabled: 1 },
      { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
    ]);
    await db.intervals.add({
      activityId: 1,
      start: Date.now() - 2000,
      end: MAX_DATE_MS,
    });

    const resumeTime = Date.now();

    await resumeActivity({ activityId: 2, startTime: resumeTime });

    // Check that parent interval was stopped
    const parentIntervals = await db.intervals
      .where("activityId")
      .equals(1)
      .toArray();
    expect(parentIntervals).toHaveLength(1);
    expect(parentIntervals[0].end).toBe(resumeTime);

    // Check that child has a new interval
    const childIntervals = await db.intervals
      .where("activityId")
      .equals(2)
      .toArray();
    expect(childIntervals).toHaveLength(1);
    expect(childIntervals[0].start).toBe(resumeTime);
    expect(childIntervals[0].end).toBe(MAX_DATE_MS);
  });

  it("throws error when activity does not exist", async () => {
    await expect(
      resumeActivity({ activityId: 999, startTime: Date.now() }),
    ).rejects.toThrow("Activity with ID 999 does not exist.");
  });
});
