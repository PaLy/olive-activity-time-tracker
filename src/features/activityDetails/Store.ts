import { create } from "zustand";
import { Dayjs } from "dayjs";

type ActivityState = {
  editInterval?: {
    start: Dayjs;
    startError: string;
    end?: Dayjs;
    endError: string;
  };
  deleteIntervalConfirmationData?: {
    intervalId: number;
  };
  isDeleteIntervalConfirmationOpen: () => boolean;
  closeDeleteIntervalConfirmation: () => void;
  openDeleteIntervalConfirmation: (intervalId: number) => void;
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  isDeleteIntervalConfirmationOpen: () =>
    !!get().deleteIntervalConfirmationData,
  closeDeleteIntervalConfirmation: () =>
    set({ deleteIntervalConfirmationData: undefined }),
  openDeleteIntervalConfirmation: (intervalId) =>
    set({ deleteIntervalConfirmationData: { intervalId } }),
}));
