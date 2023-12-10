import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { CreateActivityState } from "./AddActivityRoute";

type Props = {
  state: CreateActivityState;
};

export const IntervalSettings = (props: Props) => {
  const { state } = props;
  const { startTime, endTime, intervalToggle: toggle, durationMs } = state;

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
        // TODO separate data and time picker? Useful for today activities
        <DateTimePicker
          sx={{ m: 1 }}
          label="Start"
          value={startTime.value}
          onChange={(value) => {
            if (value) {
              startTime.value = value;
            }
          }}
          maxDate={endTime.value}
          disableFuture
          ampm={false}
          viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
          }}
        />
      )}
      {toggle.value === "finished" && (
        <DateTimePicker
          sx={{ m: 1 }}
          label="End"
          value={endTime.value}
          onChange={(value) => {
            if (value) {
              endTime.value = value;
            }
          }}
          minDate={startTime.value}
          disableFuture
          ampm={false}
          viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
          }}
        />
      )}
      <Typography sx={{ m: 1 }}>{durationMs}</Typography>
    </>
  );
};
