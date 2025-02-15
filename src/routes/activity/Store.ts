import { create } from "zustand";
import { Activity } from "../../data/activity/Storage";
import { Interval } from "../../data/interval/Interval";
import { Moment } from "moment";

type DeleteIntervalConfirmationData = {
  activity: Activity;
  interval: Interval;
};

type ActivityState = {
  editInterval?: {
    start: Moment;
    startError: string;
    end?: Moment;
    endError: string;
  };
  deleteIntervalConfirmationData?: {
    activity: Activity;
    interval: Interval;
  };
  isDeleteIntervalConfirmationOpen: () => boolean;
  closeDeleteIntervalConfirmation: () => void;
  openDeleteIntervalConfirmation: (
    data: DeleteIntervalConfirmationData,
  ) => void;
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  isDeleteIntervalConfirmationOpen: () =>
    !!get().deleteIntervalConfirmationData,
  closeDeleteIntervalConfirmation: () =>
    set({ deleteIntervalConfirmationData: undefined }),
  openDeleteIntervalConfirmation: (data) =>
    set({ deleteIntervalConfirmationData: data }),
}));
