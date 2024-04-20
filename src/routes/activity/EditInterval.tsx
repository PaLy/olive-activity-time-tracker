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
import { useLoaderData, useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import { Interval } from "../../data/interval/Interval";
import { Activity } from "../../data/activity/Storage";
import { useActivityPath } from "../../data/activity/Signals";
import { useIntervalDuration } from "../../data/interval/Signals";
import { Moment } from "moment/moment";
import { Signal, useComputed } from "@preact/signals-react";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteIntervalConfirmationData } from "./DeleteIntervalConfirmation";
import { DateTimeRangePicker } from "../../components/DateTimeRangePicker";
import { useEditInterval } from "../../data/interval/Operations";
import { openSnackbar } from "./AppSnackbar";

export type EditIntervalLoaderData = {
  activity: Activity;
  interval: Interval;
  edit: Signal<{
    start: Signal<Moment>;
    startError: Signal<string>;
    end: Signal<Moment | undefined>;
    endError: Signal<string>;
  }>;
};

export const EditInterval = () => {
  const loaderData = useLoaderData() as EditIntervalLoaderData;
  const { activity, edit } = loaderData;
  const activityPath = useActivityPath(activity);
  const editedInterval = useComputed(() => ({
    start: edit.value.start.value,
    end: edit.value.end?.value,
  }));
  const duration = useIntervalDuration(editedInterval.value, true);
  const navigate = useNavigate();

  const omitEndTimePicker = useComputed(() => !edit.value.end.value);

  const { save, saving } = useSave(loaderData);

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
                    onClick={save}
                    disabled={
                      saving ||
                      !!edit.value.startError.value ||
                      !!edit.value.endError.value
                    }
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

const useSave = (args: EditIntervalLoaderData) => {
  const { interval, edit } = args;
  const navigate = useNavigate();

  const { mutate, isPending } = useEditInterval({
    onSuccess: () => {
      openSnackbar({ message: "Interval successfully changed" });
      navigate(-1);
    },
  });

  return {
    save: async () => {
      // TODO validate intervals + update ancestors
      mutate({
        interval,
        edit: { start: edit.value.start.value, end: edit.value.end.value },
      });
    },
    saving: isPending,
  };
};
