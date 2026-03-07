import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActivityListSettings } from "../services";
import { useLiveQuery } from "dexie-react-hooks";
import { DEFAULT_ACTIVITY_LIST_SETTINGS } from "../constants";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock("../../../db/queries/settings", () => ({
  getActivityListSettings: vi.fn(),
}));

describe("settings/services", () => {
  describe("useActivityListSettings", () => {
    it("returns default settings when no settings exist", () => {
      vi.mocked(useLiveQuery).mockReturnValue(undefined);

      const { result } = renderHook(() => useActivityListSettings());

      expect(result.current).toEqual(DEFAULT_ACTIVITY_LIST_SETTINGS);
    });

    it("returns settings value when available", () => {
      const mockSettings = {
        showPercentage: true,
        showCost: {
          show: true,
          perHour: "50",
          currency: "USD" as const,
        },
        showDuration: false,
      };

      vi.mocked(useLiveQuery).mockReturnValue({ value: mockSettings });

      const { result } = renderHook(() => useActivityListSettings());

      expect(result.current).toEqual(mockSettings);
    });

    it("returns default settings when value is null", () => {
      vi.mocked(useLiveQuery).mockReturnValue({ value: null });

      const { result } = renderHook(() => useActivityListSettings());

      expect(result.current).toEqual(DEFAULT_ACTIVITY_LIST_SETTINGS);
    });

    it("handles undefined return from useLiveQuery", () => {
      vi.mocked(useLiveQuery).mockReturnValue(undefined);

      const { result } = renderHook(() => useActivityListSettings());

      expect(result.current).toBeDefined();
      expect(result.current).toEqual(DEFAULT_ACTIVITY_LIST_SETTINGS);
    });

    it("returns undefined from query callback when getActivityListSettings rejects", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Capture the callback passed to useLiveQuery
      let queryCallback: (() => unknown) | undefined;
      vi.mocked(useLiveQuery).mockImplementation((fn: () => unknown) => {
        queryCallback = fn;
        return undefined;
      });

      renderHook(() => useActivityListSettings());

      // Execute the captured callback, which should call getActivityListSettings
      // and handle the rejection via .catch
      const { getActivityListSettings } =
        await import("../../../db/queries/settings");
      vi.mocked(getActivityListSettings).mockRejectedValueOnce(
        new Error("DB error"),
      );

      const result = await queryCallback!();
      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
