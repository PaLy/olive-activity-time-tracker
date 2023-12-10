import { Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import { CreateActivityState } from "./AddActivityRoute";
import { useNavigate } from "react-router-dom";
import { batch, signal } from "@preact/signals-react";
import { nanoid } from "nanoid";
import { addInterval } from "../../data/interval/Update";
import { Activity } from "../../data/activity/Storage";
import { activities, rootActivity } from "../../data/activity/Signals";
import { addActivity } from "../../data/activity/Update";
import { Interval } from "../../data/interval/Interval";

type Props = {
  state: CreateActivityState;
};

export const FinishButton = (props: Props) => {
  const { state } = props;
  const { intervalToggle } = state;
  const navigate = useNavigate();

  return (
    <Button
      variant="text"
      startIcon={
        intervalToggle.value !== "finished" ? <PlayArrowIcon /> : <SaveIcon />
      }
      onClick={() => {
        if (checkValid(state)) {
          createActivity(state);
          navigate(-1);
        }
      }}
    >
      {intervalToggle.value === "finished" ? "Save" : "Start"}
    </Button>
  );
};

const checkValid = (state: CreateActivityState) => {
  const {
    existingActivity,
    existingActivityError,
    nameToggle,
    name,
    nameError,
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
  // TODO time can be invalid if I choose yesterday 23:59, then choose today and don't choose a time...
  return true;
};

const createActivity = (state: CreateActivityState) => {
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
  const end = intervalToggle.value === "finished" ? endTime.value : null;
  const parentActivity = state.parentActivity.value ?? rootActivity.value;
  const newInterval: Interval = {
    id: nanoid(),
    start: signal(start),
    end: signal(end),
  };

  batch(() => {
    addInterval(newInterval);

    if (nameToggle.value === "new") {
      const id = nanoid();
      const newActivity: Activity = {
        id,
        parentID: signal(parentActivity.id),
        name: signal(name.value),
        intervalIDs: signal([newInterval.id]),
        childIDs: signal([]),
      };
      addActivity(newActivity);
    } else {
      if (existingActivity.value) {
        const activity = activities.value.get(existingActivity.value.id)!;
        activity.intervalIDs.value = [
          ...activity.intervalIDs.value,
          newInterval.id,
        ];
      }
    }
  });
};
