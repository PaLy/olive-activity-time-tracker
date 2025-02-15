import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Modal,
  Paper,
  Slide,
  Typography,
} from "@mui/material";
import { useLoaderData } from "react-router";
import SaveIcon from "@mui/icons-material/Save";
import { Interval } from "../../data/interval/Interval";
import { Activity } from "../../data/activity/Storage";
import { useActivityPath } from "../../data/activity/Signals";
import { useIntervalDuration } from "../../data/interval/Signals";
import DeleteIcon from "@mui/icons-material/Delete";
import { DateTimeRangePicker } from "../../components/DateTimeRangePicker";
import { useEditInterval } from "../../data/activity/Operations";
import { useNavigate } from "../Router";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { useActivityStore } from "./Store";
import { useState } from "react";
import { Moment } from "moment";

export type EditIntervalLoaderData = {
  activity: Activity;
  interval: Interval;
};

export const EditInterval = () => {
  const loaderData = useLoaderData() as EditIntervalLoaderData;
  const { activity, interval } = loaderData;
  const [state, setState] = useState({
    start: interval.start,
    startError: "",
    end: interval.end,
    endError: "",
  });

  const openDeleteIntervalConfirmation = useActivityStore(
    (state) => state.openDeleteIntervalConfirmation,
  );

  const activityPath = useActivityPath(activity);
  const editedInterval = {
    start: state.start,
    end: state.end,
  };
  const duration = useIntervalDuration(editedInterval, true);
  const navigate = useNavigate();

  const omitEndTimePicker = !state.end;

  const { save, saving } = useSave(loaderData, editedInterval);

  return (
    <>
      <Modal open={true} onClose={() => navigate(-1)}>
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Container maxWidth={"sm"} disableGutters>
              <Paper square sx={{ p: 2, borderRadius: "32px 32px 0 0" }}>
                <Typography variant="h6" sx={{ m: 1 }}>
                  {activityPath}
                </Typography>
                <DateTimeRangePicker
                  // TODO limit by own and descendant intervals
                  startTime={state.start}
                  setStartTime={(start) => setState({ ...state, start })}
                  startTimeError={state.startError}
                  setStartTimeError={(startError) =>
                    setState({ ...state, startError })
                  }
                  endTime={state.end}
                  setEndTime={(end) => setState({ ...state, end })}
                  endTimeError={state.endError}
                  setEndTimeError={(endError) =>
                    setState({ ...state, endError })
                  }
                  omitEndTimePicker={omitEndTimePicker}
                />
                <Typography sx={{ m: 1 }}>{duration}</Typography>
                <Grid container justifyContent={"space-between"}>
                  <IconButton
                    aria-label="delete"
                    onClick={() => openDeleteIntervalConfirmation(loaderData)}
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
        </Slide>
      </Modal>
    </>
  );
};

const useSave = (
  args: EditIntervalLoaderData,
  editedInterval: { start: Moment; end?: Moment },
) => {
  const { interval, activity } = args;
  const { start, end } = editedInterval;
  const openSuccessSnackbar = useAppSnackbarStore((state) => state.openSuccess);
  const navigate = useNavigate();

  const { mutate, isPending } = useEditInterval({
    onSuccess: () => {
      openSuccessSnackbar("Interval successfully changed");
      navigate(-1);
    },
  });

  return {
    save: async () => {
      // TODO validate intervals + update ancestors
      mutate({
        interval,
        activity,
        edit: { start, end },
      });
    },
    saving: isPending,
  };
};
