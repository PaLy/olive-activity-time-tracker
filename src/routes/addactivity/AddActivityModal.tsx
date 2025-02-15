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
import { useEffect } from "react";
import { useCreateActivityStore } from "./Store";

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
  const init = useCreateActivityStore((state) => state.init);
  const isInitialized = useCreateActivityStore((state) => state.isInitialized);
  const reset = useCreateActivityStore((state) => state.reset);
  const isFinished = useCreateActivityStore((state) => state.isFinished);
  const checkValid = useCreateActivityStore((state) => state.checkValid);
  const navigate = useNavigate();
  const expandPathToRoot = useExpandChildrenPathToRoot();
  const createActivity = useCreateActivity();

  useEffect(() => {
    init(anyActivityLogged);
    return reset;
  }, []);

  return (
    isInitialized() && (
      <>
        <FullScreenModalHeader
          finishButtonProps={{
            startIcon: isFinished() ? <PlayArrowIcon /> : <SaveIcon />,
            onClick: async () => {
              if (checkValid()) {
                navigate(-1);
                const activity = await createActivity();
                // TODO handle error
                expandPathToRoot(activity);
              }
            },
            children: isFinished() ? "Save" : "Start",
          }}
        />
        <Box sx={{ ml: 1, mr: 1 }}>
          <IntervalSettings />
          <Name />
        </Box>
      </>
    )
  );
};

const useCreateActivity = () => {
  const { mutateAsync: addActivity } = useAddActivity();
  const { mutateAsync: addInterval } = useAddInterval();
  const getStartTime = useCreateActivityStore((state) => state.getStartTime);
  const getEndTime = useCreateActivityStore((state) => state.getEndTime);
  const getParentID = useCreateActivityStore((state) => state.getParentID);
  const name = useCreateActivityStore((state) => state.name);
  const nameToggle = useCreateActivityStore((state) => state.nameToggle);
  const existingActivity = useCreateActivityStore(
    (state) => state.existingActivity,
  );

  return async () => {
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
