import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  activityDuration,
  activityFullName,
  depth,
  getNonRootAncestors,
  useStartActivity,
  useStopActivity,
} from "../services";
import { ActivityTreeNode } from "../../../db/queries/activitiesTree";
import { MAX_DATE_MS } from "../../../utils/date";
import { db } from "../../../db/db";

describe("activities/services", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("activityDuration", () => {
    it("returns subtreeDuration for finished activity", () => {
      const activity = {
        subtreeLastEndTime: 5000,
        subtreeDuration: 3000,
        subtreeDurationComputedAt: 5000,
      } as ActivityTreeNode;
      const interval = { start: 0, end: 10000 };
      expect(activityDuration(activity, interval, 7000)).toBe(3000);
    });

    it("adds elapsed time for in-progress activity within interval", () => {
      const activity = {
        subtreeLastEndTime: MAX_DATE_MS,
        subtreeDuration: 1000,
        subtreeDurationComputedAt: 5000,
      } as ActivityTreeNode;
      const interval = { start: 0, end: 10000 };
      const time = 7000; // time < interval.end => inProgressInInterval = true
      expect(activityDuration(activity, interval, time)).toBe(
        1000 + (7000 - 5000),
      );
    });

    it("calculates correctly for in-progress activity past interval end, endTime > subtreeDurationComputedAt", () => {
      const activity = {
        subtreeLastEndTime: MAX_DATE_MS,
        subtreeDuration: 1000,
        subtreeDurationComputedAt: 5000,
      } as ActivityTreeNode;
      const interval = { start: 0, end: 8000 };
      const time = 12000; // time >= interval.end => not inProgressInInterval
      // endTime = Math.min(12000, 8000) = 8000 > 5000 => adds endTime - computedAt
      expect(activityDuration(activity, interval, time)).toBe(
        1000 + (8000 - 5000),
      );
    });

    it("returns just subtreeDuration when endTime <= subtreeDurationComputedAt", () => {
      const activity = {
        subtreeLastEndTime: MAX_DATE_MS,
        subtreeDuration: 1000,
        subtreeDurationComputedAt: 10000,
      } as ActivityTreeNode;
      const interval = { start: 0, end: 8000 };
      const time = 12000; // time >= interval.end
      // endTime = Math.min(12000, 8000) = 8000 <= 10000 => just subtreeDuration
      expect(activityDuration(activity, interval, time)).toBe(1000);
    });
  });

  describe("useStartActivity", () => {
    it("starts an activity successfully", async () => {
      await db.activities.add({
        name: "Test",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });

      const { result } = renderHook(() => useStartActivity());

      await act(async () => {
        await result.current.mutate({
          activity: { id: 1 } as ActivityTreeNode,
        });
      });

      expect(result.current.isPending).toBe(false);
    });

    it("shows error snackbar when start fails", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Close db to force error
      await db.close();

      const { result } = renderHook(() => useStartActivity());

      await act(async () => {
        await result.current.mutate({
          activity: { id: 999 } as ActivityTreeNode,
        });
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result.current.isPending).toBe(false);
      consoleErrorSpy.mockRestore();
      await db.open();
    });
  });

  describe("useStopActivity", () => {
    it("stops an activity successfully", async () => {
      await db.activities.add({
        name: "Test",
        parentId: -1,
        expanded: 0,
        notificationsEnabled: 1,
      });
      await db.intervals.add({
        activityId: 1,
        start: Date.now() - 60000,
        end: MAX_DATE_MS,
      });

      const { result } = renderHook(() => useStopActivity());

      await act(async () => {
        await result.current.mutate({
          activity: { id: 1 } as ActivityTreeNode,
        });
      });

      expect(result.current.isPending).toBe(false);
    });

    it("shows error snackbar when stop fails", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await db.close();

      const { result } = renderHook(() => useStopActivity());

      await act(async () => {
        await result.current.mutate({
          activity: { id: 999 } as ActivityTreeNode,
        });
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result.current.isPending).toBe(false);
      consoleErrorSpy.mockRestore();
      await db.open();
    });
  });

  describe("activityFullName", () => {
    it("returns full name with ancestors", () => {
      const root = { id: -1, name: "Root" } as ActivityTreeNode;
      const parent = { id: 1, name: "Work", parent: root } as ActivityTreeNode;
      const child = {
        id: 2,
        name: "Coding",
        parent: parent,
      } as ActivityTreeNode;
      expect(activityFullName(child)).toBe("Work / Coding");
    });

    it("returns just name for root-level activity", () => {
      const root = { id: -1, name: "Root" } as ActivityTreeNode;
      const activity = {
        id: 1,
        name: "Work",
        parent: root,
      } as ActivityTreeNode;
      expect(activityFullName(activity)).toBe("Work");
    });
  });

  describe("getNonRootAncestors", () => {
    it("excludes root from ancestors", () => {
      const root = { id: -1, name: "Root" } as ActivityTreeNode;
      const parent = { id: 1, name: "Work", parent: root } as ActivityTreeNode;
      const child = {
        id: 2,
        name: "Coding",
        parent: parent,
      } as ActivityTreeNode;
      const ancestors = getNonRootAncestors(child);
      expect(ancestors).toEqual([parent]);
    });

    it("returns empty for root-level activity", () => {
      const root = { id: -1, name: "Root" } as ActivityTreeNode;
      const activity = {
        id: 1,
        name: "Work",
        parent: root,
      } as ActivityTreeNode;
      expect(getNonRootAncestors(activity)).toEqual([]);
    });
  });

  describe("depth", () => {
    it("returns 0 for root-level activity", () => {
      const root = { id: -1, name: "Root" } as ActivityTreeNode;
      const activity = {
        id: 1,
        name: "Work",
        parent: root,
      } as ActivityTreeNode;
      expect(depth(activity)).toBe(0);
    });

    it("returns correct depth for nested activity", () => {
      const root = { id: -1, name: "Root" } as ActivityTreeNode;
      const parent = { id: 1, name: "Work", parent: root } as ActivityTreeNode;
      const child = {
        id: 2,
        name: "Coding",
        parent: parent,
      } as ActivityTreeNode;
      expect(depth(child)).toBe(1);
    });

    it("returns 0 when no parent", () => {
      const activity = { id: 1, name: "Work" } as ActivityTreeNode;
      expect(depth(activity)).toBe(0);
    });
  });
});
