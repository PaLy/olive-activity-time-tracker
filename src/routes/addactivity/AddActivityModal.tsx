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
import {
  useActivityNameExists,
  useAnyActivityLogged,
} from "../../data/activity/Hooks";
import { useAddActivity, useAddInterval } from "../../data/activity/Operations";
import { CreateActivityState, useCreateActivityStore } from "./Store";
import { useEffectOnceAfter } from "../../utils/ReactLifecycle";

export const AddActivityModal = () => {
  const { pathname } = useLocation();
  return (
    <FullScreenModal open={pathname.endsWith("/activity/add")}>
      <Content />
    </FullScreenModal>
  );
};

const Content = () => {
  const { anyActivityLogged, isLoading } = useAnyActivityLogged();
  const init = useCreateActivityStore((state) => state.init);
  const initialized = useCreateActivityStore((state) => state.isInitialized());
  const reset = useCreateActivityStore((state) => state.reset);
  const finished = useCreateActivityStore((state) => state.isFinished());
  const checkValid = useCreateActivityStore((state) => state.checkValid);
  const navigate = useNavigate();
  const expandPathToRoot = useExpandChildrenPathToRoot();
  const createActivity = useCreateActivity();
  const name = useCreateActivityStore((state) => state.name);
  const parentActivity = useCreateActivityStore(
    (state) => state.parentActivity,
  );
  const getState = useCreateActivityStore((state) => state.getState);
  const activityNameExists = useActivityNameExists(name, parentActivity);

  useEffectOnceAfter(!isLoading, () => {
    init(anyActivityLogged);
    return reset;
  });

  return (
    initialized && (
      <>
        <FullScreenModalHeader
          finishButtonProps={{
            startIcon: finished ? <SaveIcon /> : <PlayArrowIcon />,
            onClick: async () => {
              if (checkValid() && !activityNameExists) {
                // navigation clears state; therefore, we need to get the state before navigating
                const state = getState();
                navigate(-1);
                const activity = await createActivity(state);
                // TODO handle error
                expandPathToRoot(activity);
              }
            },
            children: finished ? "Save" : "Start",
          }}
        />
        <Box sx={{ ml: 1, mr: 1 }}>
          <IntervalSettings />
          <Name activityNameExists={activityNameExists} />
        </Box>
      </>
    )
  );
};

const useCreateActivity = () => {
  const { mutateAsync: addActivity } = useAddActivity();
  const { mutateAsync: addInterval } = useAddInterval();

  return async (state: CreateActivityState) => {
    const {
      existingActivity,
      nameToggle,
      getParentID,
      name,
      getStartTime,
      getEndTime,
    } = state;
    let activity = existingActivity;

    if (nameToggle === "new") {
      const id = nanoid();
      const newActivity: Activity = {
        id,
        parentID: getParentID(),
        name: name,
        intervals: [],
        childIDs: [],
      };
      await addActivity({ activity: newActivity });
      activity = newActivity;
    }

    if (activity) {
      const newInterval: Interval = {
        id: nanoid(),
        start: getStartTime(),
        end: getEndTime(),
      };
      await addInterval({ activity, interval: newInterval });
      return activity;
    } else {
      throw new Error("Invalid state.");
    }
  };
};
