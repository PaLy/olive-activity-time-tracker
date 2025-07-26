import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { Moment } from "moment";

type Props = {
  startTime: Moment;
  startTimeError: string;
  endTime: Moment | undefined;
  endTimeError: string;
  omitEndTimePicker: boolean;
  setStartTime: (startTime: Moment) => void;
  setStartTimeError: (error: string) => void;
  setEndTime: (endTime: Moment) => void;
  setEndTimeError: (error: string) => void;
};

export const DateTimeRangePicker = (props: Props) => {
  const {
    startTime,
    startTimeError,
    endTime,
    endTimeError,
    omitEndTimePicker,
    setStartTime,
    setStartTimeError,
    setEndTime,
    setEndTimeError,
  } = props;

  return (
    <>
      <DateTimePicker
        sx={{ m: 1 }}
        label="Start"
        value={startTime}
        onChange={(value) => {
          if (value) {
            setStartTime(value);
          }
        }}
        maxDateTime={endTime}
        disableFuture
        ampm={false}
        viewRenderers={{
          hours: renderTimeViewClock,
          minutes: renderTimeViewClock,
        }}
        format={DATE_TIME_PICKER_FORMAT}
        onError={(error) => {
          switch (true) {
            case error === "maxTime" && omitEndTimePicker:
            case error === "disableFuture":
              setStartTimeError("Please select a past time");
              return;
            case error === "maxTime" && !omitEndTimePicker:
              setStartTimeError("Please select a time before the end time");
              return;
            default:
              setStartTimeError(error ?? "");
          }
        }}
        slotProps={{ textField: { helperText: startTimeError } }}
      />
      {!omitEndTimePicker && (
        <DateTimePicker
          sx={{ m: 1 }}
          label="End"
          value={endTime}
          onChange={(value) => {
            if (value) {
              setEndTime(value);
            }
          }}
          minDateTime={startTime}
          disableFuture
          ampm={false}
          viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
          }}
          format={DATE_TIME_PICKER_FORMAT}
          onError={(error) => {
            switch (true) {
              case error === "disableFuture":
                setEndTimeError("Please select a past time");
                return;
              case error === "minTime":
                setEndTimeError("Please select a time after the start time");
                return;
              default:
                setEndTimeError(error ?? "");
            }
          }}
          slotProps={{ textField: { helperText: endTimeError } }}
        />
      )}
    </>
  );
};

const DATE_TIME_PICKER_FORMAT = "ddd, MMM D, YYYY HH:mm";
