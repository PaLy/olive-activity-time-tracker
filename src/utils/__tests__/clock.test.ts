import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import dayjs from "../dayjs";
import { useClockStore, useTickingClock } from "../clock";

describe("clock", () => {
  beforeEach(() => {
    // Reset store state
    useClockStore.setState({
      time: dayjs(),
      frozen: false,
    });
  });

  describe("useClockStore", () => {
    it("initializes with current time and not frozen", () => {
      const { result } = renderHook(() => useClockStore());

      expect(result.current.frozen).toBe(false);
      expect(result.current.time).toBeDefined();
    });

    it("freeze() sets frozen to true", () => {
      const { result } = renderHook(() => useClockStore());

      act(() => {
        result.current.freeze();
      });

      expect(result.current.frozen).toBe(true);
    });

    it("unfreeze() sets frozen to false and updates time", () => {
      const { result } = renderHook(() => useClockStore());

      act(() => {
        result.current.freeze();
      });
      expect(result.current.frozen).toBe(true);

      const beforeTime = result.current.time;

      act(() => {
        result.current.unfreeze();
      });

      expect(result.current.frozen).toBe(false);
      // Time should be updated when unfreezing
      expect(result.current.time).not.toBe(beforeTime);
    });

    it("tick() updates time when not frozen", () => {
      const { result } = renderHook(() => useClockStore());

      const beforeTime = result.current.time;

      act(() => {
        result.current.tick();
      });

      expect(result.current.time).not.toBe(beforeTime);
    });

    it("tick() does not update time when frozen", () => {
      const { result } = renderHook(() => useClockStore());

      act(() => {
        result.current.freeze();
      });

      const frozenTime = result.current.time;

      act(() => {
        result.current.tick();
      });

      expect(result.current.time).toBe(frozenTime);
    });
  });

  describe("useTickingClock", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it("sets up interval to tick every second", () => {
      const setIntervalSpy = vi.spyOn(window, "setInterval");
      const clearIntervalSpy = vi.spyOn(window, "clearInterval");

      const { unmount } = renderHook(() => useTickingClock());

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
