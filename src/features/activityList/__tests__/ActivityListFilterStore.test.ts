import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  useDateRangeFilterStore,
  useDayFilterStore,
  useMonthFilterStore,
} from "../ActivityListFilterStore";
import dayjs from "../../../utils/dayjs";

describe("ActivityListFilterStore", () => {
  beforeEach(() => {
    // Reset stores to initial state
    useDateRangeFilterStore.setState({
      start: dayjs().subtract(6, "days"),
      end: dayjs(),
    });
    useDayFilterStore.setState({
      day: dayjs().subtract(1, "day"),
    });
    useMonthFilterStore.setState({
      month: dayjs(),
    });
  });

  describe("useDateRangeFilterStore", () => {
    it("has default start and end dates", () => {
      const { result } = renderHook(() => useDateRangeFilterStore());

      expect(result.current.start).toBeDefined();
      expect(result.current.end).toBeDefined();
      expect(result.current.start.isBefore(result.current.end)).toBe(true);
    });

    it("updates start date", () => {
      const { result } = renderHook(() => useDateRangeFilterStore());
      const newStart = dayjs().subtract(10, "days");

      act(() => {
        result.current.setStart(newStart);
      });

      expect(result.current.start.isSame(newStart, "day")).toBe(true);
    });

    it("updates end date", () => {
      const { result } = renderHook(() => useDateRangeFilterStore());
      const newEnd = dayjs().add(1, "day");

      act(() => {
        result.current.setEnd(newEnd);
      });

      expect(result.current.end.isSame(newEnd, "day")).toBe(true);
    });

    it("allows setting both start and end dates", () => {
      const { result } = renderHook(() => useDateRangeFilterStore());
      const newStart = dayjs().subtract(30, "days");
      const newEnd = dayjs().subtract(15, "days");

      act(() => {
        result.current.setStart(newStart);
        result.current.setEnd(newEnd);
      });

      expect(result.current.start.isSame(newStart, "day")).toBe(true);
      expect(result.current.end.isSame(newEnd, "day")).toBe(true);
    });
  });

  describe("useDayFilterStore", () => {
    it("has default day set to yesterday", () => {
      const { result } = renderHook(() => useDayFilterStore());
      const yesterday = dayjs().subtract(1, "day");

      expect(result.current.day.isSame(yesterday, "day")).toBe(true);
    });

    it("updates day", () => {
      const { result } = renderHook(() => useDayFilterStore());
      const newDay = dayjs().subtract(5, "days");

      act(() => {
        result.current.setDay(newDay);
      });

      expect(result.current.day.isSame(newDay, "day")).toBe(true);
    });

    it("updates day to today", () => {
      const { result } = renderHook(() => useDayFilterStore());
      const today = dayjs();

      act(() => {
        result.current.setDay(today);
      });

      expect(result.current.day.isSame(today, "day")).toBe(true);
    });
  });

  describe("useMonthFilterStore", () => {
    it("has default month set to current month", () => {
      const { result } = renderHook(() => useMonthFilterStore());
      const currentMonth = dayjs();

      expect(result.current.month.isSame(currentMonth, "month")).toBe(true);
    });

    it("updates month", () => {
      const { result } = renderHook(() => useMonthFilterStore());
      const newMonth = dayjs().subtract(3, "months");

      act(() => {
        result.current.setMonth(newMonth);
      });

      expect(result.current.month.isSame(newMonth, "month")).toBe(true);
    });

    it("updates month to next month", () => {
      const { result } = renderHook(() => useMonthFilterStore());
      const nextMonth = dayjs().add(1, "month");

      act(() => {
        result.current.setMonth(nextMonth);
      });

      expect(result.current.month.isSame(nextMonth, "month")).toBe(true);
    });
  });

  describe("Store independence", () => {
    it("changes in one store do not affect others", () => {
      const rangeHook = renderHook(() => useDateRangeFilterStore());
      const dayHook = renderHook(() => useDayFilterStore());
      const monthHook = renderHook(() => useMonthFilterStore());

      const newStart = dayjs().subtract(100, "days");
      const newDay = dayjs().subtract(50, "days");
      const newMonth = dayjs().subtract(6, "months");

      act(() => {
        rangeHook.result.current.setStart(newStart);
        dayHook.result.current.setDay(newDay);
        monthHook.result.current.setMonth(newMonth);
      });

      expect(rangeHook.result.current.start.isSame(newStart, "day")).toBe(true);
      expect(dayHook.result.current.day.isSame(newDay, "day")).toBe(true);
      expect(monthHook.result.current.month.isSame(newMonth, "month")).toBe(
        true,
      );
    });
  });
});
