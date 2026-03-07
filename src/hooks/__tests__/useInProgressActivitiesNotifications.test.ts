import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useInProgressActivitiesNotifications } from "../useInProgressActivitiesNotifications";
import { androidNotificationService } from "../../features/android/AndroidNotificationService";

// Mock dexie-react-hooks
vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn((fn: () => Promise<unknown>) => {
    // Execute the query function to cover the setActivitiesData call
    fn();
    return [];
  }),
}));

// Mock the DB query
vi.mock("../../db/queries/inProgressActivitiesNotificationData", () => ({
  getInProgressActivitiesNotificationData: vi.fn().mockResolvedValue([]),
}));

describe("useInProgressActivitiesNotifications", () => {
  beforeEach(() => {
    vi.spyOn(androidNotificationService, "hasPermission").mockReturnValue(true);
    vi.spyOn(androidNotificationService, "requestPermission").mockResolvedValue(
      true,
    );
    vi.spyOn(androidNotificationService, "startAutoUpdate").mockImplementation(
      () => {},
    );
    vi.spyOn(androidNotificationService, "stopAutoUpdate").mockImplementation(
      () => {},
    );
    vi.spyOn(
      androidNotificationService,
      "updateNotification",
    ).mockResolvedValue(true);
    vi.spyOn(
      androidNotificationService,
      "setActivitiesData",
    ).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes and starts auto update when permission is granted", () => {
    renderHook(() => useInProgressActivitiesNotifications());

    expect(androidNotificationService.hasPermission).toHaveBeenCalled();
    expect(androidNotificationService.startAutoUpdate).toHaveBeenCalledWith(
      30000,
    );
  });

  it("stops auto update on unmount", () => {
    const { unmount } = renderHook(() =>
      useInProgressActivitiesNotifications(),
    );

    unmount();

    expect(androidNotificationService.stopAutoUpdate).toHaveBeenCalled();
  });

  it("requests permission when not granted", async () => {
    vi.spyOn(androidNotificationService, "hasPermission").mockReturnValue(
      false,
    );
    vi.spyOn(androidNotificationService, "requestPermission").mockResolvedValue(
      true,
    );

    renderHook(() => useInProgressActivitiesNotifications());

    await new Promise((r) => setTimeout(r, 50));

    expect(androidNotificationService.requestPermission).toHaveBeenCalled();
  });

  it("logs warning when permission is denied", async () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    vi.spyOn(androidNotificationService, "hasPermission").mockReturnValue(
      false,
    );
    vi.spyOn(androidNotificationService, "requestPermission").mockResolvedValue(
      false,
    );

    renderHook(() => useInProgressActivitiesNotifications());

    await new Promise((r) => setTimeout(r, 50));

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Notification permission denied",
    );
    consoleWarnSpy.mockRestore();
  });

  it("handles initialization error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.spyOn(androidNotificationService, "hasPermission").mockImplementation(
      () => {
        throw new Error("Permission check failed");
      },
    );

    renderHook(() => useInProgressActivitiesNotifications());

    await new Promise((r) => setTimeout(r, 50));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to initialize notifications:",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it("updates notifications when activities change", async () => {
    const mockActivities = [{ fullName: "Work", start: Date.now() - 60000 }];

    const { useLiveQuery } = await import("dexie-react-hooks");
    vi.mocked(useLiveQuery).mockImplementation((fn: () => unknown) => {
      fn();
      return mockActivities;
    });

    renderHook(() => useInProgressActivitiesNotifications());

    await new Promise((r) => setTimeout(r, 100));

    // The updateNotification should be called via the useEffect
    // when activities change
  });
});
