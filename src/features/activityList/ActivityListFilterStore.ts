import { create } from "zustand";
import moment, { Moment } from "moment";

type DateRangeFilterState = {
  start: Moment;
  end: Moment;
  setStart: (start: Moment) => void;
  setEnd: (end: Moment) => void;
};

type DayFilterState = {
  day: Moment;
  setDay: (day: Moment) => void;
};

type MonthFilterState = {
  month: Moment;
  setMonth: (month: Moment) => void;
};

const yesterday = () => moment().subtract(1, "day");

export const useDateRangeFilterStore = create<DateRangeFilterState>((set) => ({
  start: moment().subtract(6, "days"),
  end: moment(),
  setStart: (start) => set({ start }),
  setEnd: (end) => set({ end }),
}));

export const useDayFilterStore = create<DayFilterState>((set) => ({
  day: yesterday(),
  setDay: (day) => set({ day }),
}));

export const useMonthFilterStore = create<MonthFilterState>((set) => ({
  month: moment(),
  setMonth: (month) => set({ month }),
}));
