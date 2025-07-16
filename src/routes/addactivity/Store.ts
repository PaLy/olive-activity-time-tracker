import moment from "moment/moment";
import { create } from "zustand/index";
import {
  AddActivityData,
  AddActivityDataActivity,
} from "../../db/queries/getAddActivityData";

type IntervalToggle = "now" | "earlier" | "finished";
export type NameToggle = "new" | "existing";

type Activity = AddActivityDataActivity;

type CreateActivityState = {
  addActivityData?: AddActivityData;
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
  init: () => void;
  isFinished: () => boolean;
  checkValid: () => boolean;
  isInitialized: () => boolean;
  reset: () => void;
  validationsOff?: boolean;
  getAnyActivityLogged: () => boolean;
  getStartTime: () => moment.Moment;
  getEndTime: () => moment.Moment | undefined;
  getParentId: () => number;
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
  setAddActivityData: (addActivityData: AddActivityData) => void;
};

export const useCreateActivityStore = create<CreateActivityState>(
  (set, get) => {
    let dialogOpenedTime: moment.Moment | null = null;

    return {
      anyActivityLogged: false,
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
      init: () => {
        dialogOpenedTime = moment();
        set({
          startTimeInput: moment()
            .subtract(30, "minutes")
            .seconds(0)
            .milliseconds(0),
          endTimeInput: moment().seconds(0).milliseconds(0),
          nameToggle: get().getAnyActivityLogged() ? "existing" : "new",
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
      getAnyActivityLogged: () => {
        const addActivityData = get().addActivityData;
        return !!addActivityData && addActivityData.activities.size > 1;
      },
      getStartTime: () =>
        get().intervalToggle === "now"
          ? dialogOpenedTime!
          : get().startTimeInput,
      getEndTime: () =>
        get().intervalToggle === "finished" ? get().endTimeInput : undefined,
      getParentId: () => get().parentActivity?.id ?? -1,
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
      setAddActivityData: (addActivityData) => {
        set({ addActivityData });
      },
    };
  },
);
