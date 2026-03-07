import { describe, expect, it } from "vitest";
import { db } from "../../db";
import { MAX_DATE_MS } from "../../../utils/date";
import { getInProgressIntervals, getInProgressIntervalIds } from "../intervals";

describe("intervals", () => {
  describe("getInProgressIntervals", () => {
    it("returns intervals that are in progress", async () => {
      // Setup test data
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now(), end: MAX_DATE_MS }, // in progress
        { activityId: 2, start: Date.now() - 1000, end: Date.now() }, // completed
        { activityId: 3, start: Date.now(), end: MAX_DATE_MS }, // in progress
      ]);

      const inProgressIntervals = await getInProgressIntervals().toArray();

      expect(inProgressIntervals).toHaveLength(2);
      expect(
        inProgressIntervals.every((interval) => interval.end === MAX_DATE_MS),
      ).toBe(true);
      expect(inProgressIntervals.map((i) => i.activityId)).toEqual([1, 3]);
    });

    it("returns empty array when no intervals are in progress", async () => {
      // Setup test data with completed intervals only
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now() - 2000, end: Date.now() - 1000 },
        { activityId: 2, start: Date.now() - 1000, end: Date.now() },
      ]);

      const inProgressIntervals = await getInProgressIntervals().toArray();

      expect(inProgressIntervals).toHaveLength(0);
    });
  });

  describe("getInProgressIntervalIds", () => {
    it("returns IDs of in-progress intervals for specific activity", async () => {
      // Setup test data
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now(), end: MAX_DATE_MS }, // in progress for activity 1
        { activityId: 1, start: Date.now() - 1000, end: Date.now() }, // completed for activity 1
        { activityId: 2, start: Date.now(), end: MAX_DATE_MS }, // in progress for activity 2
        { activityId: 1, start: Date.now(), end: MAX_DATE_MS }, // another in progress for activity 1
      ]);

      const inProgressIds = await getInProgressIntervalIds(1);

      expect(inProgressIds).toHaveLength(2);
      expect(inProgressIds).toEqual([1, 4]); // IDs of the in-progress intervals for activity 1
    });

    it("returns empty array when activity has no in-progress intervals", async () => {
      // Setup test data
      await db.intervals.bulkAdd([
        { activityId: 1, start: Date.now() - 2000, end: Date.now() - 1000 }, // completed
        { activityId: 2, start: Date.now(), end: MAX_DATE_MS }, // in progress for different activity
      ]);

      const inProgressIds = await getInProgressIntervalIds(1);

      expect(inProgressIds).toHaveLength(0);
    });

    it("returns empty array when activity has no intervals", async () => {
      const inProgressIds = await getInProgressIntervalIds(999);

      expect(inProgressIds).toHaveLength(0);
    });
  });
});
