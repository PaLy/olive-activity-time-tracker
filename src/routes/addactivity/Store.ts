import moment from "moment/moment";
import { Activity } from "../../data/activity/Storage";
import { create } from "zustand/index";

type IntervalToggle = "now" | "earlier" | "finished";
export type NameToggle = "new" | "existing";

type CreateActivityState = {
  intervalToggle: IntervalToggle;
  startTimeInput: moment.Moment;
  startTimeError: string;
  endTimeInput: moment.Moment;
  endTimeError: string;
  nameToggle: NameToggle;
  name: string;
  nameError: string;
  parentActivity: Activity | null;
  existingActivity: Activity | null;
  existingActivityError: string;
  init: (anyActivityLogged: boolean) => void;
  isFinished: () => boolean;
  checkValid: () => boolean;
  isInitialized: () => boolean;
  reset: () => void;
  validationsOff?: boolean;
  getStartTime: () => moment.Moment;
  getEndTime: () => moment.Moment | undefined;
  getParentID: () => string;
  setIntervalToggle: (intervalToggle: IntervalToggle) => void;
  setNameToggle: (nameToggle: NameToggle) => void;
  setName: (name: string) => void;
  setNameError: (nameError: string) => void;
  setParentActivity: (parentActivity: Activity | null) => void;
  setExistingActivity: (existingActivity: Activity | null) => void;
  setExistingActivityError: (existingActivityError: string) => void;
  setStartTimeInput: (startTimeInput: moment.Moment) => void;
  setEndTimeInput: (endTimeInput: moment.Moment) => void;
  setStartTimeError: (startTimeError: string) => void;
  setEndTimeError: (endTimeError: string) => void;
  setValidationsOff: (validationsOff: boolean) => void;
};

export const useCreateActivityStore = create<CreateActivityState>(
  (set, get) => {
    let dialogOpenedTime: moment.Moment | null = null;

    return {
      intervalToggle: "now",
      startTimeInput: moment(),
      startTimeError: "",
      endTimeInput: moment(),
      endTimeError: "",
      nameToggle: "new",
      name: "",
      nameError: "",
      parentActivity: null,
      existingActivity: null,
      existingActivityError: "",
      validationsOff: false,
      init: (anyActivityLogged: boolean) => {
        dialogOpenedTime = moment();
        set({
          startTimeInput: moment()
            .subtract(30, "minutes")
            .seconds(0)
            .milliseconds(0),
          endTimeInput: moment().seconds(0).milliseconds(0),
          nameToggle: anyActivityLogged ? "existing" : "new",
        });
      },
      isInitialized: () => dialogOpenedTime !== null,
      reset: () => {
        dialogOpenedTime = null;
        set({
          intervalToggle: "now",
          startTimeInput: moment(),
          startTimeError: "",
          endTimeInput: moment(),
          endTimeError: "",
          nameToggle: "new",
          name: "",
          nameError: "",
          parentActivity: null,
          existingActivity: null,
          existingActivityError: "",
          validationsOff: false,
        });
      },
      isFinished: () => get().intervalToggle === "finished",
      checkValid: () => {
        const {
          existingActivity,
          nameToggle,
          name,
          startTimeError,
          endTimeError,
        } = get();
        if (nameToggle === "new") {
          if (name === "") {
            set({ nameError: "Cannot be empty" });
            return false;
          }
        } else {
          if (!existingActivity) {
            set({ existingActivityError: "Cannot be empty" });
            return false;
          }
        }
        return !startTimeError && !endTimeError;
      },
      getStartTime: () =>
        get().intervalToggle === "now"
          ? dialogOpenedTime!
          : get().startTimeInput,
      getEndTime: () =>
        get().intervalToggle === "finished" ? get().endTimeInput : undefined,
      getParentID: () => get().parentActivity?.id ?? "root",
      setIntervalToggle: (intervalToggle) => set({ intervalToggle }),
      setNameToggle: (nameToggle) => set({ nameToggle }),
      setName: (name) => set({ name }),
      setNameError: (nameError) => set({ nameError }),
      setParentActivity: (parentActivity) => set({ parentActivity }),
      setExistingActivity: (existingActivity) => set({ existingActivity }),
      setExistingActivityError: (existingActivityError) =>
        set({ existingActivityError }),
      setStartTimeInput: (startTimeInput) => {
        set({ startTimeInput });
      },
      setEndTimeInput: (endTimeInput) => {
        set({ endTimeInput });
      },
      setStartTimeError: (startTimeError) => {
        set({ startTimeError });
      },
      setEndTimeError: (endTimeError) => {
        set({ endTimeError });
      },
      setValidationsOff: (validationsOff) => {
        set({ validationsOff });
      },
    };
  },
);
