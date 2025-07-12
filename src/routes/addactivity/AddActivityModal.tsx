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
import { NameToggle, useCreateActivityStore } from "./Store";
import { useEffectOnceAfter } from "../../utils/ReactLifecycle";
import { Moment } from "moment";

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
  const nameToggle = useCreateActivityStore((state) => state.nameToggle);
  const parentActivity = useCreateActivityStore(
    (state) => state.parentActivity,
  );
  const validationsOff = useCreateActivityStore(
    (state) => state.validationsOff,
  );
  const setValidationsOff = useCreateActivityStore(
    (state) => state.setValidationsOff,
  );

  const activityNameExists =
    useActivityNameExists(name, parentActivity) && !validationsOff;

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
              if (
                checkValid() &&
                !(nameToggle === "new" && activityNameExists)
              ) {
                // navigation clears state; therefore, we need to get the state before navigating
                const state = useCreateActivityStore.getState();
                const createActivityOptions: CreateActivityOptions = {
                  existingActivity: state.existingActivity,
                  nameToggle: state.nameToggle,
                  parentID: state.getParentID(),
                  name,
                  start: state.getStartTime(),
                  end: state.getEndTime(),
                };

                // it takes some time while the modal is closed and the creation of the new activity would show validation errors
                setValidationsOff(true);
                const activity = await createActivity(createActivityOptions);
                // TODO handle error
                expandPathToRoot(activity);
                navigate(-1);
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

type CreateActivityOptions = {
  existingActivity: Activity | null;
  nameToggle: NameToggle;
  parentID: string;
  name: string;
  start: Moment;
  end: Moment | undefined;
};

const useCreateActivity = () => {
  const { mutateAsync: addActivity } = useAddActivity();
  const { mutateAsync: addInterval } = useAddInterval();

  return async (options: CreateActivityOptions) => {
    const { existingActivity, nameToggle, parentID, name, start, end } =
      options;
    let activity = existingActivity;

    if (nameToggle === "new") {
      const id = nanoid();
      const newActivity: Activity = {
        id,
        parentID,
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
        start,
        end,
      };
      await addInterval({ activity, interval: newInterval });
      return activity;
    } else {
      throw new Error("Invalid state.");
    }
  };
};
