import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useActivityNameEditing } from "../useActivityNameEditing";
import { db } from "../../../db/db";
import { ActivityDetailsData } from "../../../db/queries/activityDetails";

describe("useActivityNameEditing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with default editing state", () => {
    const { result } = renderHook(() => useActivityNameEditing(1));
    expect(result.current.editingState.editMode).toBe(false);
    expect(result.current.editingState.name).toBe("");
    expect(result.current.editingState.siblingNames.size).toBe(0);
    expect(result.current.editingState.validationError).toBe("");
  });

  describe("handleEditStart", () => {
    it("enters edit mode with correct state", async () => {
      await db.activities.bulkAdd([
        {
          name: "Parent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child1",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child2",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const activities = new Map();
      activities.set(2, { id: 2, name: "Child1", parentId: 1 });
      activities.set(3, { id: 3, name: "Child2", parentId: 1 });
      const activityDetailsData = {
        activities,
      } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(2));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      expect(result.current.editingState.editMode).toBe(true);
      expect(result.current.editingState.name).toBe("Child1");
      expect(result.current.editingState.siblingNames.has("child2")).toBe(true);
      expect(result.current.editingState.validationError).toBe("");
    });

    it("does nothing when activityDetailsData is null", async () => {
      const { result } = renderHook(() => useActivityNameEditing(1));

      await act(async () => {
        await result.current.handleEditStart(
          undefined as unknown as ActivityDetailsData,
        );
      });

      expect(result.current.editingState.editMode).toBe(false);
    });

    it("shows error snackbar when getSiblingActivities fails", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Don't add activities so getSiblingActivities will fail
      const activities = new Map();
      activities.set(999, { id: 999, name: "Test", parentId: 1 });
      const activityDetailsData = {
        activities,
      } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(999));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result.current.editingState.editMode).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  });

  describe("handleNameChange", () => {
    it("updates name and validates", async () => {
      await db.activities.bulkAdd([
        {
          name: "Parent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child1",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child2",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const activities = new Map();
      activities.set(2, { id: 2, name: "Child1", parentId: 1 });
      const activityDetailsData = { activities } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(2));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      act(() => {
        result.current.handleNameChange("NewName");
      });

      expect(result.current.editingState.name).toBe("NewName");
      expect(result.current.editingState.validationError).toBe("");
    });

    it("sets validation error for empty name", async () => {
      await db.activities.bulkAdd([
        {
          name: "Parent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child1",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const activities = new Map();
      activities.set(2, { id: 2, name: "Child1", parentId: 1 });
      const activityDetailsData = { activities } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(2));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      act(() => {
        result.current.handleNameChange("   ");
      });

      expect(result.current.editingState.validationError).toBe(
        "Activity name cannot be empty",
      );
    });

    it("sets validation error for duplicate sibling name", async () => {
      await db.activities.bulkAdd([
        {
          name: "Parent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child1",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child2",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const activities = new Map();
      activities.set(2, { id: 2, name: "Child1", parentId: 1 });
      const activityDetailsData = { activities } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(2));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      act(() => {
        result.current.handleNameChange("Child2");
      });

      expect(result.current.editingState.validationError).toBe(
        "An activity with this name already exists in the same parent",
      );
    });
  });

  describe("handleSave", () => {
    it("saves and resets editing state on success", async () => {
      await db.activities.bulkAdd([
        {
          name: "Parent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child1",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const activities = new Map();
      activities.set(2, { id: 2, name: "Child1", parentId: 1 });
      const activityDetailsData = { activities } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(2));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      act(() => {
        result.current.handleNameChange("NewName");
      });

      await act(async () => {
        result.current.handleSave();
        // Wait for promise to resolve
        await new Promise((r) => setTimeout(r, 50));
      });

      expect(result.current.editingState.editMode).toBe(false);
      expect(result.current.editingState.name).toBe("");

      // Verify DB was updated
      const activity = await db.activities.get(2);
      expect(activity?.name).toBe("NewName");
    });

    it("does not save when validation fails (empty name)", async () => {
      await db.activities.bulkAdd([
        {
          name: "Parent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child1",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const activities = new Map();
      activities.set(2, { id: 2, name: "Child1", parentId: 1 });
      const activityDetailsData = { activities } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(2));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      act(() => {
        result.current.handleNameChange("  ");
      });

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.editingState.editMode).toBe(true);
      expect(result.current.editingState.validationError).toBe(
        "Activity name cannot be empty",
      );
    });

    it("shows error snackbar when editActivityName fails", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await db.activities.bulkAdd([
        {
          name: "Parent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child1",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const activities = new Map();
      activities.set(2, { id: 2, name: "Child1", parentId: 1 });
      const activityDetailsData = { activities } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(2));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      act(() => {
        result.current.handleNameChange("ValidName");
      });

      // Close db to force an error
      await db.close();

      await act(async () => {
        result.current.handleSave();
        await new Promise((r) => setTimeout(r, 100));
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();

      // Re-open db for cleanup
      await db.open();
    });
  });

  describe("handleCancel", () => {
    it("resets editing state", async () => {
      await db.activities.bulkAdd([
        {
          name: "Parent",
          parentId: -1,
          expanded: 0,
          notificationsEnabled: 1,
        },
        {
          name: "Child1",
          parentId: 1,
          expanded: 0,
          notificationsEnabled: 1,
        },
      ]);

      const activities = new Map();
      activities.set(2, { id: 2, name: "Child1", parentId: 1 });
      const activityDetailsData = { activities } as ActivityDetailsData;

      const { result } = renderHook(() => useActivityNameEditing(2));

      await act(async () => {
        await result.current.handleEditStart(activityDetailsData);
      });

      expect(result.current.editingState.editMode).toBe(true);

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.editingState.editMode).toBe(false);
      expect(result.current.editingState.name).toBe("");
      expect(result.current.editingState.siblingNames.size).toBe(0);
      expect(result.current.editingState.validationError).toBe("");
    });
  });
});
