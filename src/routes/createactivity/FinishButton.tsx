import { Button, Grid } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import { CreateActivityState } from "./CreateActivityDialog";
import { useNavigate } from "react-router-dom";
import { batch, signal } from "@preact/signals-react";
import { nanoid } from "nanoid";
import { activities, Activity, addActivity } from "../../data/Activity";
import { addInterval, Interval } from "../../data/Interval";
import { rootActivity } from "../../data/signals/Activity";

type Props = {
  state: CreateActivityState;
};

export const FinishButton = (props: Props) => {
  const { state } = props;
  const { intervalToggle } = state;
  const navigate = useNavigate();

  return (
    <Grid
      container
      direction={"column"}
      alignItems={"center"}
      sx={{ m: 1, mt: 3 }}
    >
      <Button
        variant="contained"
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
    </Grid>
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
        parentActivityID: signal(parentActivity.id),
        name: signal(name.value),
        intervalIds: signal([newInterval.id]),
        childActivityIDs: signal([]),
      };
      addActivity(newActivity);
    } else {
      if (existingActivity.value) {
        const activity = activities.value.get(existingActivity.value.id)!;
        activity.intervalIds.value = [
          ...activity.intervalIds.value,
          newInterval.id,
        ];
      }
    }
  });
};
