import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { DateTimeRangePicker } from "../../components/DateTimeRangePicker";
import moment from "moment/moment";
import { humanize } from "../../data/interval/Algorithms";
import { useClockStore } from "../../data/interval/Signals";
import { useCreateActivityStore } from "./Store";

export const IntervalSettings = () => {
  const toggle = useCreateActivityStore((state) => state.intervalToggle);
  const setToggle = useCreateActivityStore((state) => state.setIntervalToggle);
  const startTimeInput = useCreateActivityStore(
    (state) => state.startTimeInput,
  );
  const startTimeError = useCreateActivityStore(
    (state) => state.startTimeError,
  );
  const endTimeInput = useCreateActivityStore((state) => state.endTimeInput);
  const endTimeError = useCreateActivityStore((state) => state.endTimeError);
  const setStartTimeInput = useCreateActivityStore(
    (state) => state.setStartTimeInput,
  );
  const setEndTimeInput = useCreateActivityStore(
    (state) => state.setEndTimeInput,
  );
  const setStartTimeError = useCreateActivityStore(
    (state) => state.setStartTimeError,
  );
  const setEndTimeError = useCreateActivityStore(
    (state) => state.setEndTimeError,
  );

  const omitEndTimePicker = toggle !== "finished";
  const duration = useDuration();

  return (
    <>
      <Box sx={{ m: 1 }}>
        <ToggleButtonGroup
          sx={{ mt: 1, mb: 1 }}
          color="primary"
          value={toggle}
          exclusive
          onChange={(event, newValue) => {
            if (newValue) {
              setToggle(newValue);
            }
          }}
          aria-label="start time"
        >
          <ToggleButton value="now">Now</ToggleButton>
          <ToggleButton value="earlier">Earlier</ToggleButton>
          <ToggleButton value="finished">Finished</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {toggle !== "now" && (
        <DateTimeRangePicker
          startTime={startTimeInput}
          setStartTime={setStartTimeInput}
          startTimeError={startTimeError}
          setStartTimeError={setStartTimeError}
          endTime={endTimeInput}
          setEndTime={setEndTimeInput}
          endTimeError={endTimeError}
          setEndTimeError={setEndTimeError}
          omitEndTimePicker={omitEndTimePicker}
        />
      )}
      <Typography sx={{ m: 1 }}>{duration}</Typography>
    </>
  );
};

const useDuration = () => {
  const intervalToggle = useCreateActivityStore(
    (state) => state.intervalToggle,
  );
  const startTime = useCreateActivityStore((state) => state.getStartTime());
  const endTimeInput = useCreateActivityStore((state) => state.endTimeInput);

  const time = useClockStore((state) => state.time);

  const inProgress = intervalToggle !== "finished";

  const finalEndTime = inProgress ? time : endTimeInput;
  const finalStartTime = moment.min(startTime, finalEndTime);

  return humanize(finalEndTime.diff(finalStartTime), inProgress);
};
