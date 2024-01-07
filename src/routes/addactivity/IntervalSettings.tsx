import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { CreateActivityState } from "./AddActivityModal";
import { DateTimeRangePicker } from "../../components/DateTimeRangePicker";
import { useComputed } from "@preact/signals-react";

type Props = {
  state: CreateActivityState;
};

export const IntervalSettings = (props: Props) => {
  const { state } = props;
  const {
    startTime,
    startTimeError,
    endTime,
    endTimeError,
    intervalToggle: toggle,
    durationMs,
  } = state;

  const omitEndTimePicker = useComputed(() => toggle.value !== "finished");

  return (
    <>
      <Box sx={{ m: 1 }}>
        <ToggleButtonGroup
          sx={{ mt: 1, mb: 1 }}
          color="primary"
          value={toggle.value}
          exclusive
          onChange={(event, newValue) => {
            if (newValue) {
              toggle.value = newValue;
            }
          }}
          aria-label="start time"
        >
          <ToggleButton value="now">Now</ToggleButton>
          <ToggleButton value="earlier">Earlier</ToggleButton>
          <ToggleButton value="finished">Finished</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {toggle.value !== "now" && (
        <DateTimeRangePicker
          startTime={startTime}
          startTimeError={startTimeError}
          endTime={endTime}
          endTimeError={endTimeError}
          omitEndTimePicker={omitEndTimePicker}
        />
      )}
      <Typography sx={{ m: 1 }}>{durationMs}</Typography>
    </>
  );
};
