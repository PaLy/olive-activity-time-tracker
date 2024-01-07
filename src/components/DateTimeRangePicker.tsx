import { DateTimePicker, renderTimeViewClock } from "@mui/x-date-pickers";
import { Signal } from "@preact/signals-react";
import { Moment } from "moment";

type Props = {
  startTime: Signal<Moment>;
  startTimeError: Signal<string>;
  endTime: Signal<Moment> | Signal<Moment | null>;
  endTimeError: Signal<string>;
  omitEndTimePicker: Signal<boolean>;
};

export const DateTimeRangePicker = (props: Props) => {
  const {
    startTime,
    startTimeError,
    endTime,
    endTimeError,
    omitEndTimePicker,
  } = props;

  return (
    <>
      <DateTimePicker
        sx={{ m: 1 }}
        label="Start"
        value={startTime.value}
        onChange={(value) => {
          if (value) {
            startTime.value = value;
          }
        }}
        maxDateTime={endTime.value}
        disableFuture
        ampm={false}
        viewRenderers={{
          hours: renderTimeViewClock,
          minutes: renderTimeViewClock,
        }}
        format={DATE_TIME_PICKER_FORMAT}
        onError={(error) => {
          switch (true) {
            case error === "maxTime" && omitEndTimePicker.value:
            case error === "disableFuture":
              startTimeError.value = "Please select a past time";
              return;
            case error === "maxTime" && !omitEndTimePicker.value:
              startTimeError.value = "Please select a time before the end time";
              return;
            default:
              startTimeError.value = error ?? "";
          }
        }}
        slotProps={{ textField: { helperText: startTimeError.value } }}
      />
      {!omitEndTimePicker.value && (
        <DateTimePicker
          sx={{ m: 1 }}
          label="End"
          value={endTime.value}
          onChange={(value) => {
            if (value) {
              endTime.value = value;
            }
          }}
          minDateTime={startTime.value}
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
                endTimeError.value = "Please select a past time";
                return;
              case error === "minTime":
                endTimeError.value =
                  "Please select a time after the start time";
                return;
              default:
                endTimeError.value = error ?? "";
            }
          }}
          slotProps={{ textField: { helperText: endTimeError.value } }}
        />
      )}
    </>
  );
};

const DATE_TIME_PICKER_FORMAT = "ddd, MMM D, YYYY HH:mm";
