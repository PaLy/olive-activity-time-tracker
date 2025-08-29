import { create } from "zustand";
import dayjs from "../../utils/dayjs";
import { Dayjs } from "dayjs";

type DateRangeFilterState = {
  start: Dayjs;
  end: Dayjs;
  setStart: (start: Dayjs) => void;
  setEnd: (end: Dayjs) => void;
};

type DayFilterState = {
  day: Dayjs;
  setDay: (day: Dayjs) => void;
};

type MonthFilterState = {
  month: Dayjs;
  setMonth: (month: Dayjs) => void;
};

const yesterday = () => dayjs().subtract(1, "day");

export const useDateRangeFilterStore = create<DateRangeFilterState>((set) => ({
  start: dayjs().subtract(6, "days"),
  end: dayjs(),
  setStart: (start) => set({ start }),
  setEnd: (end) => set({ end }),
}));

export const useDayFilterStore = create<DayFilterState>((set) => ({
  day: yesterday(),
  setDay: (day) => set({ day }),
}));

export const useMonthFilterStore = create<MonthFilterState>((set) => ({
  month: dayjs(),
  setMonth: (month) => set({ month }),
}));
