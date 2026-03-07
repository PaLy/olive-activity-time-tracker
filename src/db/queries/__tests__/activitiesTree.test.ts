import { describe, expect, it } from "vitest";
import { db } from "../../db";
import { getActivitiesTree } from "../activitiesTree";

describe("activitiesTree", () => {
  describe("getActivitiesTree", () => {
    it("builds activity tree with intervals within time range", async () => {
      // Setup test data
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 1, notificationsEnabled: 1 },
        { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
      ]);
      await db.intervals.bulkAdd([
        { activityId: 1, start: 1000, end: 2000 }, // Within range
        { activityId: 2, start: 1500, end: 2500 }, // Within range
        { activityId: 1, start: 3000, end: 4000 }, // Outside range
      ]);

      const tree = await getActivitiesTree({ start: 500, end: 3000 });

      expect(tree.id).toBe(-1);
      expect(tree.name).toBe("root");
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].name).toBe("Parent");
      expect(tree.children[0].children).toHaveLength(1);
      expect(tree.children[0].children[0].name).toBe("Child");
    });

    it("handles empty activity tree", async () => {
      const tree = await getActivitiesTree({ start: 1000, end: 2000 });

      expect(tree.id).toBe(-1);
      expect(tree.name).toBe("root");
      expect(tree.children).toHaveLength(0);
    });

    it("calculates subtree duration correctly", async () => {
      // Setup test data with overlapping intervals
      await db.activities.add({
        name: "Activity",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });
      await db.intervals.bulkAdd([
        { activityId: 1, start: 1000, end: 2000 }, // 1000ms
        { activityId: 1, start: 1500, end: 2500 }, // 1000ms, but overlaps 500ms
      ]);

      const tree = await getActivitiesTree({ start: 500, end: 3000 });

      // Should calculate non-overlapping duration: 1000 + (2500-2000) = 1500ms
      expect(tree.children[0].subtreeDuration).toBe(1500);
    });
  });
});
