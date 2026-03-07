import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AndroidNotificationService } from "../AndroidNotificationService";

describe("AndroidNotificationService", () => {
  let service: AndroidNotificationService;
  let mockAndroid: {
    hasNotificationPermission: ReturnType<typeof vi.fn>;
    requestNotificationPermission: ReturnType<typeof vi.fn>;
    updateNotification: ReturnType<typeof vi.fn>;
    stopNotification: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset singleton instance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AndroidNotificationService as any).instance = undefined;
    service = AndroidNotificationService.getInstance();

    // Mock Android interface
    mockAndroid = {
      hasNotificationPermission: vi.fn().mockReturnValue(true),
      requestNotificationPermission: vi.fn().mockReturnValue("not_needed"),
      updateNotification: vi.fn().mockReturnValue("success"),
      stopNotification: vi.fn().mockReturnValue("success"),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Android = mockAndroid;
  });

  afterEach(() => {
    vi.clearAllTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).Android;
  });

  describe("getInstance", () => {
    it("returns the same instance", () => {
      const instance1 = AndroidNotificationService.getInstance();
      const instance2 = AndroidNotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("hasPermission", () => {
    it("returns true when Android interface has permission", () => {
      mockAndroid.hasNotificationPermission.mockReturnValue(true);
      expect(service.hasPermission()).toBe(true);
    });

    it("returns false when Android interface does not have permission", () => {
      mockAndroid.hasNotificationPermission.mockReturnValue(false);
      expect(service.hasPermission()).toBe(false);
    });

    it("returns false when Android interface is not available", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).Android;
      expect(service.hasPermission()).toBe(false);
    });

    it("returns false when permission check throws error", () => {
      mockAndroid.hasNotificationPermission.mockImplementation(() => {
        throw new Error("Permission check failed");
      });
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(service.hasPermission()).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("requestPermission", () => {
    it("returns true when permission is not needed", async () => {
      mockAndroid.requestNotificationPermission.mockReturnValue("not_needed");
      const result = await service.requestPermission();
      expect(result).toBe(true);
    });

    it("returns false when Android interface is not available", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).Android;
      const result = await service.requestPermission();
      expect(result).toBe(false);
    });

    it("waits for permission result when requested", async () => {
      mockAndroid.requestNotificationPermission.mockReturnValue("requested");

      const permissionPromise = service.requestPermission();

      // Simulate permission granted event
      setTimeout(() => {
        const event = new CustomEvent("notificationPermissionResult", {
          detail: "granted",
        });
        window.dispatchEvent(event);
      }, 50);

      const result = await permissionPromise;
      expect(result).toBe(true);
    });

    it("returns false when permission is denied", async () => {
      mockAndroid.requestNotificationPermission.mockReturnValue("requested");

      const permissionPromise = service.requestPermission();

      // Simulate permission denied event
      setTimeout(() => {
        const event = new CustomEvent("notificationPermissionResult", {
          detail: "denied",
        });
        window.dispatchEvent(event);
      }, 50);

      const result = await permissionPromise;
      expect(result).toBe(false);
    });

    it("returns false on error", async () => {
      mockAndroid.requestNotificationPermission.mockImplementation(() => {
        throw new Error("Request failed");
      });
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = await service.requestPermission();
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("updateNotification", () => {
    it("updates notification with activities data", async () => {
      const activitiesData = [
        { fullName: "Task 1", start: Date.now() - 3600000 },
        { fullName: "Task 2", start: Date.now() - 1800000 },
      ];

      const result = await service.updateNotification(activitiesData);

      expect(result).toBe(true);
      expect(mockAndroid.updateNotification).toHaveBeenCalled();
    });

    it("stops notification when activities list is empty", async () => {
      const result = await service.updateNotification([]);

      expect(result).toBe(true);
      expect(mockAndroid.stopNotification).toHaveBeenCalled();
    });

    it("returns false when Android interface is not available", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).Android;
      const result = await service.updateNotification([
        { fullName: "Task 1", start: Date.now() },
      ]);
      expect(result).toBe(false);
    });

    it("requests permission if not granted", async () => {
      mockAndroid.hasNotificationPermission.mockReturnValue(false);
      mockAndroid.requestNotificationPermission.mockReturnValue("not_needed");

      const activitiesData = [{ fullName: "Task 1", start: Date.now() }];
      const result = await service.updateNotification(activitiesData);

      expect(result).toBe(true);
      expect(mockAndroid.requestNotificationPermission).toHaveBeenCalled();
    });

    it("returns false when permission request is denied", async () => {
      mockAndroid.hasNotificationPermission.mockReturnValue(false);
      mockAndroid.requestNotificationPermission.mockReturnValue("denied");

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});
      const activitiesData = [{ fullName: "Task 1", start: Date.now() }];
      const result = await service.updateNotification(activitiesData);

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("handles error during notification update", async () => {
      mockAndroid.updateNotification.mockImplementation(() => {
        throw new Error("Update failed");
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const activitiesData = [{ fullName: "Task 1", start: Date.now() }];
      const result = await service.updateNotification(activitiesData);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("stopNotification", () => {
    it("stops notification successfully", () => {
      const result = service.stopNotification();
      expect(result).toBe(true);
      expect(mockAndroid.stopNotification).toHaveBeenCalled();
    });

    it("returns false when Android interface is not available", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).Android;
      const result = service.stopNotification();
      expect(result).toBe(false);
    });

    it("handles error during stop", () => {
      mockAndroid.stopNotification.mockImplementation(() => {
        throw new Error("Stop failed");
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = service.stopNotification();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("startAutoUpdate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("starts automatic updates", () => {
      const activitiesData = [{ fullName: "Task 1", start: Date.now() }];
      service.setActivitiesData(activitiesData);

      service.startAutoUpdate(5000);

      expect(mockAndroid.updateNotification).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(5000);
      expect(mockAndroid.updateNotification).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(5000);
      expect(mockAndroid.updateNotification).toHaveBeenCalledTimes(3);
    });

    it("stops previous auto-update when starting new one", () => {
      const activitiesData = [{ fullName: "Task 1", start: Date.now() }];
      service.setActivitiesData(activitiesData);

      service.startAutoUpdate(5000);
      const firstCallCount = mockAndroid.updateNotification.mock.calls.length;

      service.startAutoUpdate(3000);

      vi.advanceTimersByTime(5000);
      // Should have been called: once from first startAutoUpdate, once from second startAutoUpdate
      expect(
        mockAndroid.updateNotification.mock.calls.length,
      ).toBeGreaterThanOrEqual(firstCallCount + 1);
    });
  });

  describe("stopAutoUpdate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("stops automatic updates and notification", () => {
      const activitiesData = [{ fullName: "Task 1", start: Date.now() }];
      service.setActivitiesData(activitiesData);

      service.startAutoUpdate(5000);
      mockAndroid.updateNotification.mockClear();

      service.stopAutoUpdate();

      vi.advanceTimersByTime(10000);
      expect(mockAndroid.updateNotification).not.toHaveBeenCalled();
      expect(mockAndroid.stopNotification).toHaveBeenCalled();
    });
  });

  describe("setActivitiesData", () => {
    it("sets activities data", () => {
      const activitiesData = [{ fullName: "Task 1", start: Date.now() }];
      service.setActivitiesData(activitiesData);

      // Verify by starting auto-update and checking if data is used
      vi.useFakeTimers();
      service.startAutoUpdate(1000);
      expect(mockAndroid.updateNotification).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
