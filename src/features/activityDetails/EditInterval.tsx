import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { LoaderFunctionArgs, useLoaderData, useParams } from "react-router";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { DateTimeRangePicker } from "../../components/DateTimeRangePicker";
import { modalSlotProps } from "../../components/FullScreenModal";
import { useNavigate } from "../../router/hooks";
import { useHistoryDialog } from "../../router/useHistoryDialog";
import { DELETE_INTERVAL_DIALOG_KEY } from "./DeleteIntervalConfirmation";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { useActivityStore } from "./Store";
import { useState } from "react";
import dayjs from "../../utils/dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import {
  EditIntervalData,
  getEditIntervalData,
  planUpdateInterval,
  updateInterval,
} from "../../db/queries/editInterval";
import { MAX_DATE_MS } from "../../utils/date";
import { useIntervalDuration } from "../intervals/hooks";
import { getActivityOptions } from "../../db/queries/activities";
import { IntervalChangesDialog } from "../../components/IntervalChangesDialog";
import { IntervalChange } from "../../db/queries/intervalOverlaps";
import { ActivityPicker } from "../../components/ActivityPicker";

type Params = {
  intervalID: string;
};

export const editIntervalLoader = async ({ params }: LoaderFunctionArgs) =>
  getEditIntervalData(parseInt(params.intervalID ?? "")).catch((e) => {
    console.error(e);
    useAppSnackbarStore.getState().openError("Interval not found");
    return undefined;
  });

export const EditInterval = () => {
  const loaderData = useLoaderData<EditIntervalData | undefined>();
  const params = useParams() as Params;
  // TODO validate intervalID is a number
  const intervalId = parseInt(params.intervalID ?? "");

  const editIntervalData = useLiveQuery(
    () =>
      // The interval may have just been deleted; the loader reports a missing one on entry.
      getEditIntervalData(intervalId).catch(() => undefined),
    [intervalId],
    loaderData,
  );

  if (!editIntervalData) {
    return null;
  }

  return <Content editIntervalData={editIntervalData} />;
};

type ContentProps = {
  editIntervalData: EditIntervalData;
};

const Content = (props: ContentProps) => {
  const { editIntervalData } = props;
  const { interval, activityFullName } = editIntervalData;
  const [activityId, setActivityId] = useState(interval.activityId);
  const activityOptions = useLiveQuery(() => getActivityOptions(), []);
  const selectedActivity = activityOptions?.find(
    (option) => option.id === activityId,
  );
  const [state, setState] = useState({
    start: interval.start,
    startError: "",
    end: interval.end,
    endError: "",
  });

  const openDeleteIntervalConfirmation = useActivityStore(
    (state) => state.openDeleteIntervalConfirmation,
  );

  const editedInterval = {
    start: state.start,
    end: state.end,
  };
  const duration = useIntervalDuration(
    editedInterval.start,
    editedInterval.end,
    true,
  );
  const navigate = useNavigate();
  const deleteDialog = useHistoryDialog(DELETE_INTERVAL_DIALOG_KEY);

  const omitEndTimePicker = state.end === MAX_DATE_MS;

  const { save, saving, pendingChanges, confirm, cancel } = useSave(
    editIntervalData,
    editedInterval,
    activityId,
  );

  return (
    <>
      <Modal
        open={true}
        onClose={() => navigate(-1)}
        slotProps={modalSlotProps}
      >
        <Box
          sx={{
            viewTransitionName: "bottom-sheet",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <Container maxWidth={"sm"} disableGutters>
            <Paper square sx={{ p: 2, borderRadius: "32px 32px 0 0" }}>
              <Typography variant="h6" sx={{ m: 1 }}>
                {activityFullName}
              </Typography>
              {activityOptions && selectedActivity && (
                <ActivityPicker
                  options={activityOptions}
                  selected={selectedActivity}
                  onChange={setActivityId}
                  size="medium"
                  label="Move to"
                  sx={{ m: 1, mt: 3, mb: 3 }}
                />
              )}
              <DateTimeRangePicker
                // TODO limit by own and descendant intervals
                startTime={dayjs(state.start)}
                setStartTime={(start) => setState({ ...state, start: +start })}
                startTimeError={state.startError}
                setStartTimeError={(startError) =>
                  setState({ ...state, startError })
                }
                endTime={dayjs(state.end)}
                setEndTime={(end) => setState({ ...state, end: +end })}
                endTimeError={state.endError}
                setEndTimeError={(endError) => setState({ ...state, endError })}
                omitEndTimePicker={omitEndTimePicker}
              />
              <Typography sx={{ m: 1 }}>{duration}</Typography>
              <Grid container sx={{ justifyContent: "space-between" }}>
                <IconButton
                  aria-label="delete"
                  onClick={() => {
                    openDeleteIntervalConfirmation(interval.id);
                    deleteDialog.open();
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  variant="text"
                  startIcon={<SaveIcon />}
                  onClick={save}
                  disabled={saving || !!state.startError || !!state.endError}
                >
                  Save
                </Button>
              </Grid>
            </Paper>
          </Container>
        </Box>
      </Modal>
      <IntervalChangesDialog
        changes={pendingChanges}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </>
  );
};

const useSave = (
  editIntervalData: EditIntervalData,
  editedInterval: { start: number; end: number },
  activityId: number,
) => {
  const { interval } = editIntervalData;
  const { start, end } = editedInterval;
  const openSuccessSnackbar = useAppSnackbarStore((state) => state.openSuccess);
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<IntervalChange[]>();

  const doSave = async () => {
    setPendingChanges(undefined);
    setSaving(true);
    return updateInterval(interval.id, start, end, activityId)
      .then(() => {
        openSuccessSnackbar("Interval successfully changed");
        navigate(-1);
      })
      .finally(() => setSaving(false))
      .catch((e) => {
        console.error(e);
        openErrorSnackbar("Failed to update interval");
      });
  };

  return {
    save: async () => {
      setSaving(true);
      const plan = await planUpdateInterval(
        interval.id,
        start,
        end,
        activityId,
      ).catch((e) => {
        console.error(e);
        openErrorSnackbar("Failed to update interval");
        return undefined;
      });
      setSaving(false);
      if (!plan) return;
      if (plan.changes.length > 0) {
        setPendingChanges(plan.changes);
      } else {
        await doSave();
      }
    },
    saving,
    pendingChanges,
    confirm: doSave,
    cancel: () => setPendingChanges(undefined),
  };
};
