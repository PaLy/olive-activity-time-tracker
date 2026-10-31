import { describe, expect, it } from "vitest";
import { db } from "../../db";
import {
  getActivity,
  getParent,
  getAncestorsById,
  expandAllActivities,
  collapseAllActivities,
  setExpanded,
  expandSelfAndAncestors,
  getSiblingActivities,
  editActivity,
  getParentOptions,
} from "../activities";

describe("activities", () => {
  describe("getActivity", () => {
    it("returns activity when it exists", async () => {
      await db.activities.add({
        name: "Test Activity",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });

      const activity = await getActivity(1);
      expect(activity.id).toBe(1);
      expect(activity.name).toBe("Test Activity");
    });

    it("throws error when activity does not exist", async () => {
      await expect(getActivity(999)).rejects.toThrow(
        "Activity with ID 999 does not exist.",
      );
    });
  });

  describe("getParent", () => {
    it("returns parent activity when activity has parent", async () => {
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child", parentId: 1, expanded: 0, notificationsEnabled: 1 },
      ]);

      const child = await db.activities.get(2);
      const parent = await getParent(child!);

      expect(parent?.id).toBe(1);
      expect(parent?.name).toBe("Parent");
    });

    it("returns undefined when activity is root", async () => {
      await db.activities.add({
        name: "Root",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });

      const root = await db.activities.get(1);
      const parent = await getParent(root!);

      expect(parent).toBeUndefined();
    });
  });

  describe("getAncestorsById", () => {
    it("returns ancestors for nested activity", async () => {
      await db.activities.bulkAdd([
        {
          name: "Grandparent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        { name: "Parent", parentId: 1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child", parentId: 2, expanded: 0, notificationsEnabled: 1 },
      ]);

      const ancestors = await getAncestorsById(3);

      expect(ancestors).toHaveLength(2);
      expect(ancestors[0].name).toBe("Grandparent");
      expect(ancestors[1].name).toBe("Parent");
    });

    it("returns empty array for root activity", async () => {
      await db.activities.add({
        name: "Root",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });

      const ancestors = await getAncestorsById(1);

      expect(ancestors).toHaveLength(0);
    });

    it("throws error when activity does not exist", async () => {
      await expect(getAncestorsById(999)).rejects.toThrow(
        "Activity with ID 999 does not exist.",
      );
    });
  });

  describe("expandAllActivities", () => {
    it("expands all collapsed activities", async () => {
      await db.activities.bulkAdd([
        {
          name: "Activity 1",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Activity 2",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Activity 3",
          parentId: -1,
          expanded: 1,
          notificationsEnabled: 1,
        },
      ]);

      await expandAllActivities();

      const activities = await db.activities.toArray();
      expect(activities.every((a) => a.expanded === 1)).toBe(true);
    });
  });

  describe("collapseAllActivities", () => {
    it("collapses all expanded activities", async () => {
      await db.activities.bulkAdd([
        {
          name: "Activity 1",
          parentId: -1,
          expanded: 1,
          notificationsEnabled: 1,
        },
        {
          name: "Activity 2",
          parentId: -1,
          expanded: 1,
          notificationsEnabled: 1,
        },
        {
          name: "Activity 3",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      await collapseAllActivities();

      const activities = await db.activities.toArray();
      expect(activities.every((a) => a.expanded === 0)).toBe(true);
    });
  });

  describe("setExpanded", () => {
    it("sets activity expanded state to true", async () => {
      await db.activities.add({
        name: "Activity",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });

      await setExpanded(1, true);

      const activity = await db.activities.get(1);
      expect(activity?.expanded).toBe(1);
    });

    it("sets activity expanded state to false", async () => {
      await db.activities.add({
        name: "Activity",
        parentId: -1,
        expanded: 1,
        notificationsEnabled: 1,
      });

      await setExpanded(1, false);

      const activity = await db.activities.get(1);
      expect(activity?.expanded).toBe(0);
    });
  });

  describe("expandSelfAndAncestors", () => {
    it("expands activity and all its ancestors", async () => {
      await db.activities.bulkAdd([
        {
          name: "Grandparent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        { name: "Parent", parentId: 1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child", parentId: 2, expanded: 0, notificationsEnabled: 1 },
      ]);

      await expandSelfAndAncestors(3);

      const grandparent = await db.activities.get(1);
      const parent = await db.activities.get(2);
      const child = await db.activities.get(3);

      expect(grandparent?.expanded).toBe(1);
      expect(parent?.expanded).toBe(1);
      expect(child?.expanded).toBe(1);
    });

    it("does nothing for already expanded activities", async () => {
      await db.activities.bulkAdd([
        {
          name: "Grandparent",
          parentId: -1,
          expanded: 1,
          notificationsEnabled: 1,
        },
        { name: "Parent", parentId: 1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child", parentId: 2, expanded: 0, notificationsEnabled: 1 },
      ]);

      await expandSelfAndAncestors(3);

      const grandparent = await db.activities.get(1);
      const parent = await db.activities.get(2);
      const child = await db.activities.get(3);

      expect(grandparent?.expanded).toBe(1); // Already expanded
      expect(parent?.expanded).toBe(1);
      expect(child?.expanded).toBe(1);
    });
  });

  describe("getSiblingActivities", () => {
    it("returns sibling activities excluding self", async () => {
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child 1", parentId: 1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child 2", parentId: 1, expanded: 0, notificationsEnabled: 1 },
        { name: "Child 3", parentId: 1, expanded: 0, notificationsEnabled: 1 },
      ]);

      const siblings = await getSiblingActivities(2); // Child 1's siblings

      expect(siblings).toHaveLength(2);
      expect(siblings.map((s) => s.name)).toEqual(["Child 2", "Child 3"]);
    });

    it("returns empty array when activity has no siblings", async () => {
      await db.activities.bulkAdd([
        { name: "Parent", parentId: -1, expanded: 0, notificationsEnabled: 1 },
        {
          name: "Only Child",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const siblings = await getSiblingActivities(2);

      expect(siblings).toHaveLength(0);
    });
  });

  describe("editActivity", () => {
    const add = (name: string, parentId: number) =>
      db.activities.add({
        name,
        parentId,
        expanded: 0,
        notificationsEnabled: 1,
      });

    it("updates activity name", async () => {
      await add("Old Name", -1);

      await editActivity(1, "New Name", -1);

      expect((await db.activities.get(1))?.name).toBe("New Name");
    });

    it("moves activity under another parent and expands it", async () => {
      await add("A", -1);
      await add("B", -1);

      await editActivity(2, "B", 1);

      expect((await db.activities.get(2))?.parentId).toBe(1);
      expect((await db.activities.get(1))?.expanded).toBe(1);
    });

    it("rejects moving under a descendant", async () => {
      await add("A", -1);
      await add("B", 1);

      await expect(editActivity(1, "A", 2)).rejects.toThrow();
      expect((await db.activities.get(1))?.parentId).toBe(-1);
    });
  });

  describe("getParentOptions", () => {
    it("excludes self and descendants and starts with root", async () => {
      await db.activities.bulkAdd([
        { name: "A", parentId: -1, expanded: 0, notificationsEnabled: 1 },
        { name: "B", parentId: 1, expanded: 0, notificationsEnabled: 1 },
        { name: "C", parentId: -1, expanded: 0, notificationsEnabled: 1 },
      ]);

      const options = await getParentOptions(1);

      expect(options.map((o) => o.id)).toEqual([-1, 3]);
    });
  });
});
