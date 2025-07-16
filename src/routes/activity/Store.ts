import { create } from "zustand";
import { Moment } from "moment";

type ActivityState = {
  editInterval?: {
    start: Moment;
    startError: string;
    end?: Moment;
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
