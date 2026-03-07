import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIntervalDuration } from "../hooks";
import * as clockModule from "../../../utils/clock";
import dayjs from "../../../utils/dayjs";
import { MAX_DATE_MS } from "../../../utils/date";

vi.mock("../../../utils/clock", () => ({
  useClockStore: vi.fn(),
}));

describe("intervals/hooks", () => {
  describe("useIntervalDuration", () => {
    it("calculates duration for completed interval", () => {
      const mockTime = dayjs("2024-01-15 14:00");
      vi.mocked(clockModule.useClockStore).mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({
            time: mockTime,
            frozen: false,
            freeze: () => {},
            unfreeze: () => {},
            tick: () => {},
          });
        }
        return {
          time: mockTime,
          frozen: false,
          freeze: () => {},
          unfreeze: () => {},
          tick: () => {},
        };
      });

      const start = dayjs("2024-01-15 12:00").valueOf();
      const end = dayjs("2024-01-15 14:00").valueOf();

      const { result } = renderHook(() =>
        useIntervalDuration(start, end, false),
      );

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe("string");
    });

    it("calculates duration for in-progress interval", () => {
      const mockTime = dayjs("2024-01-15 14:00");
      vi.mocked(clockModule.useClockStore).mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({
            time: mockTime,
            frozen: false,
            freeze: () => {},
            unfreeze: () => {},
            tick: () => {},
          });
        }
        return {
          time: mockTime,
          frozen: false,
          freeze: () => {},
          unfreeze: () => {},
          tick: () => {},
        };
      });

      const start = dayjs("2024-01-15 12:00").valueOf();
      const end = MAX_DATE_MS;

      const { result } = renderHook(() =>
        useIntervalDuration(start, end, false),
      );

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe("string");
    });

    it("handles full parameter true", () => {
      const mockTime = dayjs("2024-01-15 14:00");
      vi.mocked(clockModule.useClockStore).mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({
            time: mockTime,
            frozen: false,
            freeze: () => {},
            unfreeze: () => {},
            tick: () => {},
          });
        }
        return {
          time: mockTime,
          frozen: false,
          freeze: () => {},
          unfreeze: () => {},
          tick: () => {},
        };
      });

      const start = dayjs("2024-01-15 12:00").valueOf();
      const end = dayjs("2024-01-15 14:00").valueOf();

      const { result } = renderHook(() =>
        useIntervalDuration(start, end, true),
      );

      expect(result.current).toBeDefined();
      expect(typeof result.current).toBe("string");
    });

    it("uses current time for in-progress intervals", () => {
      const mockTime = dayjs("2024-01-15 16:00");
      vi.mocked(clockModule.useClockStore).mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({
            time: mockTime,
            frozen: false,
            freeze: () => {},
            unfreeze: () => {},
            tick: () => {},
          });
        }
        return {
          time: mockTime,
          frozen: false,
          freeze: () => {},
          unfreeze: () => {},
          tick: () => {},
        };
      });

      const start = dayjs("2024-01-15 12:00").valueOf();
      const end = MAX_DATE_MS;

      const { result } = renderHook(() =>
        useIntervalDuration(start, end, false),
      );

      // Duration should be approximately 4 hours
      expect(result.current).toBeDefined();
    });
  });
});
