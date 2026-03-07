import { describe, expect, it } from "vitest";
import { db } from "../../db";
import {
  getEditIntervalData,
  updateInterval,
  deleteInterval,
} from "../editInterval";

describe("editInterval", () => {
  describe("getEditIntervalData", () => {
    it("returns interval data with activity full name", async () => {
      // Setup test data
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
      ]);
      await db.intervals.add({
        activityId: 2,
        start: Date.now() - 1000,
        end: Date.now(),
      });

      const result = await getEditIntervalData(1);

      expect(result.interval.id).toBe(1);
      expect(result.interval.activityId).toBe(2);
      expect(result.activityFullName).toBe("Parent / Child");
    });

    it("throws error when interval does not exist", async () => {
      await expect(getEditIntervalData(999)).rejects.toThrow(
        "Interval with ID 999 does not exist.",
      );
    });

    it("throws error when activity does not exist", async () => {
      // Create interval with non-existent activity ID
      await db.intervals.add({
        activityId: 999,
        start: Date.now() - 1000,
        end: Date.now(),
      });

      await expect(getEditIntervalData(1)).rejects.toThrow(
        "Activity with ID 999 does not exist.",
      );
    });
  });

  describe("updateInterval", () => {
    it("updates interval start and end times", async () => {
      // Setup test data
      await db.intervals.add({
        activityId: 1,
        start: Date.now() - 2000,
        end: Date.now() - 1000,
      });

      const newStart = Date.now() - 1500;
      const newEnd = Date.now() - 500;

      await updateInterval(1, newStart, newEnd);

      const updatedInterval = await db.intervals.get(1);
      expect(updatedInterval?.start).toBe(newStart);
      expect(updatedInterval?.end).toBe(newEnd);
    });

    it("throws error when start time is not less than end time", async () => {
      await db.intervals.add({
        activityId: 1,
        start: Date.now() - 2000,
        end: Date.now() - 1000,
      });

      const newStart = Date.now() - 500;
      const newEnd = Date.now() - 1000; // end before start

      await expect(updateInterval(1, newStart, newEnd)).rejects.toThrow(
        "Start time must be less than end time.",
      );
    });

    it("throws error when start time equals end time", async () => {
      await db.intervals.add({
        activityId: 1,
        start: Date.now() - 2000,
        end: Date.now() - 1000,
      });

      const sameTime = Date.now() - 500;

      await expect(updateInterval(1, sameTime, sameTime)).rejects.toThrow(
        "Start time must be less than end time.",
      );
    });

    it("throws error when interval does not exist", async () => {
      await expect(
        updateInterval(999, Date.now() - 1000, Date.now()),
      ).rejects.toThrow("Interval with ID 999 does not exist.");
    });
  });

  describe("deleteInterval", () => {
    it("deletes the interval", async () => {
      // Setup test data
      await db.intervals.add({
        activityId: 1,
        start: Date.now() - 2000,
        end: Date.now() - 1000,
      });

      // Verify interval exists
      expect(await db.intervals.get(1)).toBeTruthy();

      await deleteInterval(1);

      // Verify interval is deleted
      expect(await db.intervals.get(1)).toBeFalsy();
    });

    it("throws error when interval does not exist", async () => {
      await expect(deleteInterval(999)).rejects.toThrow(
        "Interval with ID 999 does not exist.",
      );
    });
  });
});
