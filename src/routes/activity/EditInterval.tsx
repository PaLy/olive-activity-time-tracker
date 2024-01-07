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
import { NavigateFunction, useLoaderData, useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import { Interval } from "../../data/interval/Interval";
import { Activity } from "../../data/activity/Storage";
import { useActivityPath } from "../../data/activity/Signals";
import { useIntervalDuration } from "../../data/interval/Signals";
import { Moment } from "moment/moment";
import { batch, Signal, useComputed } from "@preact/signals-react";
import { editInterval } from "../../data/interval/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import { successSnackbarMessage, successSnackbarOpen } from "./SuccessSnackbar";
import { deleteIntervalConfirmationData } from "./DeleteIntervalConfirmation";
import { DateTimeRangePicker } from "../../components/DateTimeRangePicker";

export type EditIntervalLoaderData = {
  activity: Signal<Activity>;
  interval: Signal<Interval>;
  edit: Signal<{
    start: Signal<Moment>;
    startError: Signal<string>;
    end: Signal<Moment | null>;
    endError: Signal<string>;
  }>;
};

export const EditInterval = () => {
  const loaderData = useLoaderData() as EditIntervalLoaderData;
  const { activity, edit } = loaderData;
  const activityPath = useActivityPath(activity);
  const duration = useIntervalDuration(edit, true);
  const navigate = useNavigate();

  const omitEndTimePicker = useComputed(() => !edit.value.end.value);

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
                  startTime={edit.value.start}
                  startTimeError={edit.value.startError}
                  endTime={edit.value.end}
                  endTimeError={edit.value.endError}
                  omitEndTimePicker={omitEndTimePicker}
                />
                <Typography sx={{ m: 1 }}>{duration}</Typography>
                <Grid container justifyContent={"space-between"}>
                  <IconButton
                    aria-label="delete"
                    onClick={() =>
                      (deleteIntervalConfirmationData.value = loaderData)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Button
                    variant="text"
                    startIcon={<SaveIcon />}
                    onClick={() => onSave(loaderData, navigate)}
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

const onSave = (args: EditIntervalLoaderData, navigate: NavigateFunction) => {
  const { interval, edit } = args;
  if (!edit.value.startError.value && !edit.value.endError.value) {
    // TODO validate intervals + update ancestors
    batch(() => {
      editInterval(interval, edit);
      successSnackbarOpen.value = true;
      successSnackbarMessage.value = "Interval successfully changed";
    });
    navigate(-1);
  }
};
