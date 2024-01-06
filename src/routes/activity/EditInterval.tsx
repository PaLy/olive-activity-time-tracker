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
import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { useIntervalDuration } from "../../data/interval/Signals";
import { Moment } from "moment/moment";
import { batch, Signal } from "@preact/signals-react";
import { editInterval } from "../../data/interval/Update";
import DeleteIcon from "@mui/icons-material/Delete";
import { successSnackbarMessage, successSnackbarOpen } from "./SuccessSnackbar";
import { deleteIntervalConfirmationData } from "./DeleteIntervalConfirmation";

export type EditIntervalLoaderData = {
  activity: Activity;
  interval: Interval;
  edit: {
    start: Signal<Moment>;
    end: Signal<Moment | null>;
  };
};

export const EditInterval = () => {
  const loaderData = useLoaderData() as EditIntervalLoaderData;
  const { activity, edit } = loaderData;
  const activityPath = useActivityPath(activity);
  const duration = useIntervalDuration(edit, true);
  const navigate = useNavigate();

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
                <DateTimePicker
                  sx={{ m: 1 }}
                  label="Start"
                  value={edit.start.value}
                  onChange={(value) => {
                    if (value) {
                      edit.start.value = value;
                    }
                  }}
                  // TODO limit by own and descendant intervals
                  maxDate={edit.end.value}
                  disableFuture
                  ampm={false}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                  }}
                />
                {edit.end.value !== null && (
                  <DateTimePicker
                    sx={{ m: 1 }}
                    label="End"
                    value={edit.end.value}
                    onChange={(value) => {
                      if (value) {
                        edit.end.value = value;
                      }
                    }}
                    disableFuture
                    ampm={false}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                    }}
                  />
                )}
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
  // TODO validate intervals + update ancestors
  batch(() => {
    editInterval(interval, edit);
    successSnackbarOpen.value = true;
    successSnackbarMessage.value = "Interval successfully changed";
  });
  navigate(-1);
};
