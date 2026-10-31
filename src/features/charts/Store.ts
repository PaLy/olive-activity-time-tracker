import { create } from "zustand";
import { ROOT_ACTIVITY_ID } from "../../db/queries/charts";
import { Period } from "./periods";

export type Granularity = "day" | "month" | "year";

type ChartsState = {
  activityId: number;
  period: Period;
  switchGranularity: Granularity;
  setActivityId: (activityId: number) => void;
  setPeriod: (period: Period) => void;
  setSwitchGranularity: (granularity: Granularity) => void;
};

export const useChartsStore = create<ChartsState>((set) => ({
  activityId: ROOT_ACTIVITY_ID,
  period: "week",
  switchGranularity: "day",
  setActivityId: (activityId) => set({ activityId }),
  setPeriod: (period) => set({ period }),
  setSwitchGranularity: (switchGranularity) => set({ switchGranularity }),
}));
