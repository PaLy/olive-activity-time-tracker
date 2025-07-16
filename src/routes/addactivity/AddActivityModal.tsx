import { IntervalSettings } from "./IntervalSettings";
import { Name } from "./Name";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import { useLocation, useNavigate } from "../Router";
import { FullScreenModal } from "../../components/FullScreenModal";
import { Box } from "@mui/material";
import { useActivityNameExists } from "../../data/activity/Hooks";
import { NameToggle, useCreateActivityStore } from "./Store";
import { useEffectOnceAfter } from "../../utils/ReactLifecycle";
import { Moment } from "moment";
import { useLiveQuery } from "dexie-react-hooks";
import {
  AddActivityDataActivity,
  getAddActivityData,
} from "../../db/queries/getAddActivityData";
import { addActivity } from "../../db/queries/addActivity";

type Activity = AddActivityDataActivity;

export const AddActivityModal = () => {
  const { pathname } = useLocation();
  return (
    <FullScreenModal open={pathname.endsWith("/activity/add")}>
      <Content />
    </FullScreenModal>
  );
};

const Content = () => {
  const init = useCreateActivityStore((state) => state.init);
  const initialized = useCreateActivityStore((state) => state.isInitialized());
  const reset = useCreateActivityStore((state) => state.reset);
  const finished = useCreateActivityStore((state) => state.isFinished());
  const checkValid = useCreateActivityStore((state) => state.checkValid);
  const navigate = useNavigate();
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
  const setAddActivityData = useCreateActivityStore(
    (state) => state.setAddActivityData,
  );

  const addActivityData = useLiveQuery(async () => {
    const addActivityData = await getAddActivityData();
    setAddActivityData(addActivityData);
    return addActivityData;
  }, [setAddActivityData]);

  const activityNameExists =
    useActivityNameExists(
      name,
      parentActivity ?? addActivityData?.activities.get(-1),
    ) && !validationsOff;

  useEffectOnceAfter(!!addActivityData, () => {
    init();
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
                  parentId: state.getParentId(),
                  name,
                  start: state.getStartTime(),
                  end: state.getEndTime(),
                };

                // it takes some time while the modal is closed and the creation of the new activity would show validation errors
                setValidationsOff(true);
                // TODO handle errors
                await createActivity(createActivityOptions);
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
  parentId: number;
  name: string;
  start: Moment;
  end: Moment | undefined;
};

const useCreateActivity = () => {
  return async (options: CreateActivityOptions) => {
    const { existingActivity, nameToggle, parentId, name, start, end } =
      options;

    if (nameToggle === "new") {
      await addActivity({
        parentId,
        name: name,
        interval: {
          start: +start,
          end: end?.valueOf(),
        },
      });
    } else {
      if (!existingActivity) {
        throw new Error(
          "Existing activity is required for existing activity toggle.",
        );
      }
      await addActivity({
        existingActivityId: existingActivity.id,
        interval: {
          start: +start,
          end: end?.valueOf(),
        },
      });
    }
  };
};
