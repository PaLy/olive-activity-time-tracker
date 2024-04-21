import { signal, useSignal } from "@preact/signals-react";
import moment from "moment";
import { IntervalSettings } from "./IntervalSettings";
import { Name } from "./Name";
import { Activity } from "../../data/activity/Storage";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import { Interval } from "../../data/interval/Interval";
import { nanoid } from "nanoid";
import { useLocation, useNavigate } from "../Router";
import { FullScreenModal } from "../../components/FullScreenModal";
import { Box } from "@mui/material";
import { useExpandChildrenPathToRoot } from "../activitylists/state/Expanded";
import { useAnyActivityLogged } from "../../data/activity/Signals";
import { useAddActivity, useAddInterval } from "../../data/activity/Operations";

export const createCreateActivityState = (anyActivityLogged: boolean) => {
  const dialogOpenedTime = signal(moment());
  const intervalToggle = signal<"now" | "earlier" | "finished">("now");
  const startTime = signal(
    moment().subtract(30, "minutes").seconds(0).milliseconds(0),
  );
  const startTimeError = signal("");
  const endTime = signal(moment().seconds(0).milliseconds(0));
  const endTimeError = signal("");
  const nameToggle = signal<"new" | "existing">(
    anyActivityLogged ? "existing" : "new",
  );
  const name = signal("");
  const nameError = signal("");
  const parentActivity = signal<Activity | null>(null);
  const existingActivity = signal<Activity | null>(null);
  const existingActivityError = signal("");

  return {
    dialogOpenedTime,
    intervalToggle,
    startTime,
    startTimeError,
    endTime,
    endTimeError,
    nameToggle,
    name,
    nameError,
    parentActivity,
    existingActivity,
    existingActivityError,
  };
};

export type CreateActivityState = ReturnType<typeof createCreateActivityState>;

export const AddActivityModal = () => {
  const { pathname } = useLocation();
  return (
    <FullScreenModal open={pathname.endsWith("/activity/add")}>
      <Content />
    </FullScreenModal>
  );
};

const Content = () => {
  const anyActivityLogged = useAnyActivityLogged();
  const state = useSignal(createCreateActivityState(anyActivityLogged)).value;
  const { intervalToggle } = state;
  const navigate = useNavigate();
  const expandPathToRoot = useExpandChildrenPathToRoot();
  const createActivity = useCreateActivity();

  return (
    <>
      <FullScreenModalHeader
        finishButtonProps={{
          startIcon:
            intervalToggle.value !== "finished" ? (
              <PlayArrowIcon />
            ) : (
              <SaveIcon />
            ),
          onClick: async () => {
            if (checkValid(state)) {
              const activity = await createActivity(state);
              // TODO handle error
              expandPathToRoot(activity);
              navigate(-1);
            }
          },
          children: intervalToggle.value === "finished" ? "Save" : "Start",
        }}
      />
      <Box sx={{ ml: 1, mr: 1 }}>
        <IntervalSettings state={state} />
        <Name state={state} />
      </Box>
    </>
  );
};

const checkValid = (state: CreateActivityState) => {
  const {
    existingActivity,
    existingActivityError,
    nameToggle,
    name,
    nameError,
    startTimeError,
    endTimeError,
  } = state;

  if (nameToggle.value === "new") {
    if (name.value === "") {
      nameError.value = "Cannot be empty";
      return false;
    }
  } else {
    if (!existingActivity.value) {
      existingActivityError.value = "Cannot be empty";
      return false;
    }
  }

  return !startTimeError.value && !endTimeError.value;
};

const useCreateActivity = () => {
  const { mutateAsync: addActivity } = useAddActivity();
  const { mutateAsync: addInterval } = useAddInterval();

  return async (state: CreateActivityState) => {
    const {
      nameToggle,
      name,
      intervalToggle,
      startTime,
      endTime,
      dialogOpenedTime,
      existingActivity,
    } = state;

    const start =
      intervalToggle.value === "now" ? dialogOpenedTime.value : startTime.value;
    const end = intervalToggle.value === "finished" ? endTime.value : undefined;
    const parentID = state.parentActivity.value?.id ?? "root";

    let activity = existingActivity.value;

    if (nameToggle.value === "new") {
      const id = nanoid();
      const newActivity: Activity = {
        id,
        parentID,
        name: name.value,
        intervals: [],
        childIDs: [],
      };
      await addActivity({ activity: newActivity });
      activity = newActivity;
    }

    if (activity) {
      const newInterval: Interval = { id: nanoid(), start, end };
      await addInterval({ activity, interval: newInterval });
      return activity;
    } else {
      throw new Error("Invalid state");
    }
  };
};
