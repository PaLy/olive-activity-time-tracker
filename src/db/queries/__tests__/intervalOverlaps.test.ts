import { describe, expect, it } from "vitest";
import { db } from "../../db";
import { updateInterval } from "../editInterval";
import { addActivity } from "../addActivity";
import { subtractRanges } from "../intervalOverlaps";

const act = (name: string, parentId: number) => ({
  name,
  parentId,
  expanded: 0 as const,
  notificationsEnabled: 1 as const,
});

describe("interval overlaps", () => {
  it("subtractRanges splits and removes", () => {
    expect(
      subtractRanges({ start: 0, end: 10 }, [{ start: 3, end: 5 }]),
    ).toEqual([
      { start: 0, end: 3 },
      { start: 5, end: 10 },
    ]);
    expect(
      subtractRanges({ start: 3, end: 5 }, [{ start: 0, end: 10 }]),
    ).toEqual([]);
  });

  it("cuts ancestor intervals when editing a child interval", async () => {
    await db.activities.bulkAdd([act("P", -1), act("C", 1)]);
    await db.intervals.bulkAdd([
      { activityId: 1, start: 0, end: 100 },
      { activityId: 2, start: 200, end: 300 },
    ]);
    await updateInterval(2, 40, 60);
    const p = await db.intervals.where("activityId").equals(1).sortBy("start");
    expect(p.map((i) => [i.start, i.end])).toEqual([
      [0, 40],
      [60, 100],
    ]);
  });

  it("cuts the edited interval by descendant intervals", async () => {
    await db.activities.bulkAdd([act("P", -1), act("C", 1)]);
    await db.intervals.bulkAdd([
      { activityId: 1, start: 200, end: 300 },
      { activityId: 2, start: 40, end: 60 },
    ]);
    await updateInterval(1, 0, 100);
    const p = await db.intervals.where("activityId").equals(1).sortBy("start");
    expect(p.map((i) => [i.start, i.end])).toEqual([
      [0, 40],
      [60, 100],
    ]);
  });

  it("removes a new interval fully covered by a descendant", async () => {
    await db.activities.bulkAdd([act("P", -1), act("C", 1)]);
    await db.intervals.add({ activityId: 2, start: 0, end: 100 });
    await addActivity({
      existingActivityId: 1,
      interval: { start: 10, end: 20 },
    });
    expect(await db.intervals.count()).toBe(1);
  });

  it("does not add an interval fully covered by the same activity", async () => {
    await db.activities.add(act("A", -1));
    await db.intervals.add({ activityId: 1, start: 0, end: 100 });
    await addActivity({
      existingActivityId: 1,
      interval: { start: 10, end: 20 },
    });
    expect(await db.intervals.count()).toBe(1);
  });

  it("drops the piece left after the descendant cut if own intervals cover it", async () => {
    await db.activities.bulkAdd([act("P", -1), act("C", 1)]);
    await db.intervals.bulkAdd([
      { activityId: 1, start: -100, end: 58 },
      { activityId: 2, start: 58, end: 128 },
    ]);
    await addActivity({
      existingActivityId: 1,
      interval: { start: 0, end: 60 },
    });
    expect(await db.intervals.count()).toBe(2);
  });

  it("concatenates a new interval with overlapping own intervals", async () => {
    await db.activities.add(act("A", -1));
    await db.intervals.add({ activityId: 1, start: 0, end: 50 });
    await addActivity({
      existingActivityId: 1,
      interval: { start: 30, end: 80 },
    });
    const all = await db.intervals.orderBy("start").toArray();
    expect(all.map((i) => [i.start, i.end])).toEqual([[0, 80]]);
  });

  it("concatenates pieces split by a tiny descendant interval", async () => {
    await db.activities.bulkAdd([act("P", -1), act("C", 1)]);
    await db.intervals.add({ activityId: 2, start: 50, end: 60 });
    await addActivity({
      existingActivityId: 2,
      interval: { start: 0, end: 100 },
    });
    const all = await db.intervals.orderBy("start").toArray();
    expect(all.map((i) => [i.activityId, i.start, i.end])).toEqual([
      [2, 0, 100],
    ]);
  });
});
