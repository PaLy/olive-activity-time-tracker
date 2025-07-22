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
import { useParams } from "react-router";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { DateTimeRangePicker } from "../../components/DateTimeRangePicker";
import { useNavigate } from "../Router";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { useActivityStore } from "./Store";
import { useState } from "react";
import moment from "moment";
import { useLiveQuery } from "dexie-react-hooks";
import {
  EditIntervalData,
  getEditIntervalData,
  updateInterval,
} from "../../db/queries/editInterval";
import { MAX_DATE_MS } from "../../utils/Date";
import { useIntervalDuration } from "../../features/intervals/hooks";

type Params = {
  intervalID: string;
};

export const EditInterval = () => {
  const params = useParams() as Params;
  // TODO validate intervalID is a number
  const intervalId = parseInt(params.intervalID ?? "");

  const editIntervalData = useLiveQuery(
    () => getEditIntervalData(intervalId),
    [intervalId],
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

  const omitEndTimePicker = state.end === MAX_DATE_MS;

  const { save, saving } = useSave(editIntervalData, editedInterval);

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
                  {activityFullName}
                </Typography>
                <DateTimeRangePicker
                  // TODO limit by own and descendant intervals
                  startTime={moment(state.start)}
                  setStartTime={(start) =>
                    setState({ ...state, start: +start })
                  }
                  startTimeError={state.startError}
                  setStartTimeError={(startError) =>
                    setState({ ...state, startError })
                  }
                  endTime={moment(state.end)}
                  setEndTime={(end) => setState({ ...state, end: +end })}
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
                    onClick={() => openDeleteIntervalConfirmation(interval.id)}
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
  editIntervalData: EditIntervalData,
  editedInterval: { start: number; end: number },
) => {
  const { interval } = editIntervalData;
  const { start, end } = editedInterval;
  const openSuccessSnackbar = useAppSnackbarStore((state) => state.openSuccess);
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  return {
    save: async () => {
      // TODO update ancestors
      setSaving(true);
      return updateInterval(interval.id, start, end)
        .then(() => {
          openSuccessSnackbar("Interval successfully changed");
          navigate(-1);
        })
        .finally(() => setSaving(false))
        .catch(() => openErrorSnackbar("Failed to update interval"));
    },
    saving,
  };
};
