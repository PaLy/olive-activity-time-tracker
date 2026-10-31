import { describe, expect, it } from "vitest";
import { db } from "../../db";
import {
  getActivityBreakdown,
  getActivityOptions,
  getFirstIntervalStart,
  getSwitchCounts,
  getSessionLengthHistogram,
  getTimeByWeekdayHour,
  getTimePerBucket,
} from "../charts";
import dayjs from "dayjs";
import { MAX_DATE_MS } from "../../../utils/date";

describe("charts", () => {
  describe("getSwitchCounts", () => {
    it("counts interval starts per bucket within the activity subtree", async () => {
      await db.activities.bulkAdd([
        { name: "work", parentId: -1, expanded: 0, notificationsEnabled: 0 },
        { name: "task", parentId: 1, expanded: 0, notificationsEnabled: 0 },
        {
          name: "personal",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 0,
        },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: 10, end: 20 },
        { activityId: 2, start: 20, end: 30 },
        { activityId: 3, start: 30, end: 120 },
        { activityId: 2, start: 120, end: 130 },
        { activityId: 2, start: 250, end: 260 }, // outside buckets
      ]);
      const buckets = [
        { start: 0, end: 100 },
        { start: 100, end: 200 },
        { start: 200, end: 250 },
      ];

      expect(await getSwitchCounts(1, buckets)).toEqual([2, 1, 0]);
      expect(await getSwitchCounts(-1, buckets)).toEqual([3, 1, 0]);
      expect(await getSwitchCounts(1, [])).toEqual([]);
    });

    it("does not count consecutive intervals of the same activity", async () => {
      await db.activities.bulkAdd([
        { name: "a", parentId: -1, expanded: 0, notificationsEnabled: 0 },
        { name: "b", parentId: -1, expanded: 0, notificationsEnabled: 0 },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: 50, end: 60 }, // before the range
        { activityId: 1, start: 110, end: 120 }, // resume of the same activity
        { activityId: 2, start: 130, end: 140 },
        { activityId: 1, start: 150, end: 160 },
        { activityId: 1, start: 170, end: 180 }, // stop and resume
      ]);
      const buckets = [{ start: 100, end: 200 }];

      expect(await getSwitchCounts(1, buckets)).toEqual([1]);
      expect(await getSwitchCounts(2, buckets)).toEqual([1]);
      expect(await getSwitchCounts(-1, buckets)).toEqual([2]);
    });

    it("finds the first interval start", async () => {
      expect(await getFirstIntervalStart()).toBeUndefined();
      await db.activities.add({
        name: "a",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 0,
      });
      await db.intervals.bulkAdd([
        { activityId: 1, start: 500, end: 600 },
        { activityId: 1, start: 100, end: 200 },
      ]);
      expect(await getFirstIntervalStart()).toBe(100);
    });
  });

  describe("root activity", () => {
    it("is offered first and covers all activities", async () => {
      await db.activities.bulkAdd([
        { name: "work", parentId: -1, expanded: 0, notificationsEnabled: 0 },
        {
          name: "personal",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 0,
        },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: 0, end: 100 },
        { activityId: 2, start: 100, end: 150 },
      ]);
      const period = { start: 0, end: 1000 };

      expect((await getActivityOptions())[0]).toEqual({
        id: -1,
        fullName: "All activities",
      });
      expect(await getActivityBreakdown(period, -1)).toEqual({
        total: 150,
        items: [
          { id: 1, name: "work", duration: 100 },
          { id: 2, name: "personal", duration: 50 },
        ],
      });
      const sessions = await getSessionLengthHistogram(-1, period);
      expect(sessions.reduce((sum, bin) => sum + bin.count, 0)).toBe(1);
      expect(
        (await getTimeByWeekdayHour(period, -1))
          .flat()
          .reduce((a, b) => a + b, 0),
      ).toBe(150);
    });
  });

  describe("getActivityBreakdown", () => {
    it("splits an activity into children and its own time", async () => {
      await db.activities.bulkAdd([
        { name: "work", parentId: -1, expanded: 0, notificationsEnabled: 0 },
        { name: "a", parentId: 1, expanded: 0, notificationsEnabled: 0 },
        { name: "b", parentId: 1, expanded: 0, notificationsEnabled: 0 },
        { name: "a1", parentId: 2, expanded: 0, notificationsEnabled: 0 },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: 0, end: 100 },
        { activityId: 2, start: 100, end: 300 },
        { activityId: 4, start: 300, end: 400 },
        { activityId: 3, start: 400, end: 450 },
      ]);

      expect(await getActivityBreakdown({ start: 0, end: 1000 }, 1)).toEqual({
        total: 450,
        items: [
          { id: 2, name: "a", duration: 300 },
          { id: 1, name: "work (itself)", duration: 100 },
          { id: 3, name: "b", duration: 50 },
        ],
      });
      expect(await getActivityBreakdown({ start: 0, end: 1000 }, 3)).toEqual({
        total: 50,
        items: [{ id: 3, name: "b", duration: 50 }],
      });
      // clipped to the period
      expect(
        (await getActivityBreakdown({ start: 350, end: 1000 }, 1)).total,
      ).toBe(100);
      expect(await getActivityBreakdown({ start: 0, end: 1000 }, 99)).toEqual({
        total: 0,
        items: [],
      });
    });
  });

  describe("getTimePerBucket", () => {
    it("returns durations for each bucket", async () => {
      await db.activities.add({
        name: "A",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 0,
      });
      await db.intervals.bulkAdd([{ activityId: 1, start: 500, end: 1500 }]);

      const result = await getTimePerBucket(
        [
          { start: 0, end: 1000 },
          { start: 1000, end: 2000 },
          { start: 2000, end: 3000 },
        ],
        1,
      );

      expect(result).toEqual([
        { start: 0, durations: [{ id: 1, name: "A", duration: 500 }] },
        { start: 1000, durations: [{ id: 1, name: "A", duration: 500 }] },
        { start: 2000, durations: [] },
      ]);
    });
  });

  describe("getSessionLengthHistogram", () => {
    it("merges sessions separated by at most the given gap", async () => {
      const min = 60_000;
      await db.activities.add({
        name: "work",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 0,
      });
      await db.intervals.bulkAdd([
        { activityId: 1, start: 0, end: 10 * min },
        { activityId: 1, start: 14 * min, end: 20 * min }, // 4 min gap
        { activityId: 1, start: 21 * min, end: 30 * min }, // 1 min gap
        { activityId: 1, start: 100 * min, end: 110 * min },
      ]);
      const period = { start: 0, end: 1000 * min };
      const counts = async (gap: number) =>
        Object.fromEntries(
          (await getSessionLengthHistogram(1, period, gap)).map((b) => [
            b.label,
            b.count,
          ]),
        );

      expect(await counts(0)).toMatchObject({ "<15m": 4, "15–30m": 0 });
      expect(await counts(min)).toMatchObject({ "<15m": 2, "15–30m": 1 });
      expect(await counts(5 * min)).toMatchObject({
        "<15m": 1,
        "30–60m": 1,
      });
    });

    it("merges touching child intervals into one session and filters by subtree", async () => {
      const min = 60_000;
      await db.activities.bulkAdd([
        { name: "work", parentId: -1, expanded: 0, notificationsEnabled: 0 },
        { name: "task", parentId: 1, expanded: 0, notificationsEnabled: 0 },
        {
          name: "personal",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 0,
        },
      ]);
      await db.intervals.bulkAdd([
        // work (10m) + task (20m) touching -> one 30m session
        { activityId: 1, start: 0, end: 10 * min },
        { activityId: 2, start: 10 * min, end: 30 * min },
        // separate 3h work session
        { activityId: 2, start: 100 * min, end: 280 * min },
        // other root, ignored
        { activityId: 3, start: 300 * min, end: 310 * min },
      ]);

      const result = await getSessionLengthHistogram(1, {
        start: 0,
        end: 1000 * min,
      });

      expect(Object.fromEntries(result.map((b) => [b.label, b.count]))).toEqual(
        {
          "<15m": 0,
          "15–30m": 0,
          "30–60m": 1,
          "1–2h": 0,
          "2–4h": 1,
          ">4h": 0,
        },
      );
    });
  });

  describe("getTimeByWeekdayHour", () => {
    it("splits intervals across hours and counts overlaps once", async () => {
      const base = dayjs("2024-01-01T09:30:00"); // Monday
      await db.activities.bulkAdd([
        { name: "A", parentId: -1, expanded: 0, notificationsEnabled: 0 },
        { name: "B", parentId: -1, expanded: 0, notificationsEnabled: 0 },
      ]);
      await db.intervals.bulkAdd([
        // 09:30-10:30
        {
          activityId: 1,
          start: base.valueOf(),
          end: base.add(1, "hour").valueOf(),
        },
        // 10:00-10:45, overlaps the first one
        {
          activityId: 2,
          start: base.add(30, "minute").valueOf(),
          end: base.add(75, "minute").valueOf(),
        },
      ]);

      const result = await getTimeByWeekdayHour(
        {
          start: base.startOf("day").valueOf(),
          end: base.endOf("day").valueOf(),
        },
        null,
      );

      expect(result[1][9]).toBe(30 * 60_000);
      expect(result[1][10]).toBe(45 * 60_000);
      expect(result[1].reduce((a, b) => a + b, 0)).toBe(75 * 60_000);
    });

    it("limits to the activity subtree when an activity is given", async () => {
      const start = dayjs("2024-01-01T09:00:00"); // Monday
      await db.activities.bulkAdd([
        { name: "work", parentId: -1, expanded: 0, notificationsEnabled: 0 },
        { name: "task", parentId: 1, expanded: 0, notificationsEnabled: 0 },
        {
          name: "personal",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 0,
        },
      ]);
      await db.intervals.bulkAdd([
        {
          activityId: 2,
          start: start.valueOf(),
          end: start.add(10, "minute").valueOf(),
        },
        {
          activityId: 3,
          start: start.add(10, "minute").valueOf(),
          end: start.add(30, "minute").valueOf(),
        },
      ]);
      const period = {
        start: start.startOf("day").valueOf(),
        end: start.endOf("day").valueOf(),
      };

      expect((await getTimeByWeekdayHour(period, 1))[1][9]).toBe(10 * 60_000);
      expect((await getTimeByWeekdayHour(period, 3))[1][9]).toBe(20 * 60_000);
    });

    it("counts in-progress intervals up to now", async () => {
      const start = dayjs("2024-01-02T08:00:00"); // Tuesday
      await db.activities.add({
        name: "A",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 0,
      });
      await db.intervals.add({
        activityId: 1,
        start: start.valueOf(),
        end: MAX_DATE_MS,
      });

      const result = await getTimeByWeekdayHour(
        {
          start: start.startOf("day").valueOf(),
          end: start.endOf("day").valueOf(),
        },
        null,
        start.add(20, "minute").valueOf(),
      );

      expect(result[2][8]).toBe(20 * 60_000);
    });
  });
});
