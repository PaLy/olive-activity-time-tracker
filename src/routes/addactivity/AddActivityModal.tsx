import { useNavigate } from "react-router-dom";
import { computed, signal, useSignal } from "@preact/signals-react";
import moment from "moment";
import { IntervalSettings } from "./IntervalSettings";
import { Name } from "./Name";
import { durationRefreshTime } from "../../data/interval/Signals";
import { Activity, activityStore } from "../../data/activity/Storage";
import { humanize } from "../../data/interval/Algorithms";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import { anyActivityLogged, rootActivity } from "../../data/activity/Signals";
import { Interval } from "../../data/interval/Interval";
import { nanoid } from "nanoid";
import { useLocation } from "../Router";
import { FullScreenModal } from "../../components/FullScreenModal";
import { Box } from "@mui/material";
import { useExpandChildrenPathToRoot } from "../activitylists/state/Expanded";

export const createCreateActivityState = () => {
  const dialogOpenedTime = signal(moment());
  const intervalToggle = signal<"now" | "earlier" | "finished">("now");
  const startTime = signal(
    moment().subtract(30, "minutes").seconds(0).milliseconds(0),
  );
  const startTimeError = signal("");
  const endTime = signal(moment().seconds(0).milliseconds(0));
  const endTimeError = signal("");
  const nameToggle = signal<"new" | "existing">(
    anyActivityLogged.value ? "existing" : "new",
  );
  const name = signal("");
  const nameError = signal("");
  const parentActivity = signal<Activity | null>(null);
  const existingActivity = signal<Activity | null>(null);
  const existingActivityError = signal("");

  const durationMs = computed(() => {
    const inProgress = intervalToggle.value !== "finished";

    const startTimeByToggle =
      intervalToggle.value === "now" ? dialogOpenedTime.value : startTime.value;

    const finalEndTime = inProgress ? durationRefreshTime.value : endTime.value;
    const finalStartTime = moment.min(startTimeByToggle, finalEndTime);

    return humanize(finalEndTime.diff(finalStartTime), inProgress);
  });

  return {
    dialogOpenedTime,
    intervalToggle,
    startTime,
    startTimeError,
    endTime,
    endTimeError,
    durationMs,
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
  const state = useSignal(createCreateActivityState()).value;
  const { intervalToggle } = state;
  const navigate = useNavigate();
  const expandPathToRoot = useExpandChildrenPathToRoot();

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

const createActivity = async (state: CreateActivityState) => {
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
  const parentActivity = state.parentActivity.value ?? rootActivity.value;

  let activity = existingActivity.value;

  if (nameToggle.value === "new") {
    const id = nanoid();
    const newActivity: Activity = {
      id,
      parentID: parentActivity.id,
      name: name.value,
      intervalIDs: [],
      childIDs: [],
    };
    await activityStore.addActivity(newActivity);
    activity = newActivity;
  }

  if (activity) {
    const newInterval: Interval = { id: nanoid(), start, end };
    await activityStore.addInterval(activity, newInterval);
    return signal(activity);
  } else {
    throw new Error("Invalid state");
  }
};
