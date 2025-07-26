import {
  DatePicker,
  DatePickerFieldProps,
  DatePickerProps,
} from "@mui/x-date-pickers/DatePicker";
import { usePickerContext } from "@mui/x-date-pickers/hooks";
import { Moment } from "moment";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useState } from "react";

export type ChipDatePickerProps = Omit<
  DatePickerProps,
  "value" | "onChange" | "onClose" | "onOpen" | "open" | "slots" | "slotProps"
> & {
  value: Moment;
  onChange: (value: Moment) => void;
  isMaxDate?: (value: Moment) => boolean;
  onBefore?: (value: Moment) => Moment;
  onNext?: (value: Moment) => Moment;
  toLabel?: (value: Moment) => string;
};

export const ChipDatePicker = (props: ChipDatePickerProps) => {
  const {
    value,
    onChange,
    isMaxDate,
    onBefore,
    onNext,
    toLabel,
    ...datePickerProps
  } = props;
  const [open, setOpen] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <DatePicker
      value={value}
      onChange={(newValue) => {
        if (newValue) {
          onChange(newValue);
        }
      }}
      slots={{ field: MyChip }}
      slotProps={{
        field: {
          isMaxDate,
          onBefore,
          onNext,
          toLabel,
        } as MyChipProps,
      }}
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      {...datePickerProps}
    />
  );
};

type MyChipAdditionalProps = {
  isMaxDate?: (value: Moment) => boolean;
  onBefore?: (value: Moment) => Moment;
  onNext?: (value: Moment) => Moment;
  toLabel?: (value: Moment) => string;
};

type MyChipProps = DatePickerFieldProps & MyChipAdditionalProps;

const MyChip = (props: MyChipProps) => {
  const { id, isMaxDate, onBefore, onNext, toLabel } = props;
  const { value, fieldFormat, setValue, setOpen, triggerRef } =
    usePickerContext();

  return (
    <Grid
      container
      alignItems={"center"}
      width={"initial"}
      minHeight={40}
      sx={{ gap: 2 }}
    >
      {onBefore && (
        <IconButton
          onClick={() => {
            if (value) {
              setValue?.(onBefore(value), { validationError: null });
            }
          }}
          disabled={!onBefore}
        >
          <NavigateBeforeIcon />
        </IconButton>
      )}
      <Chip
        id={id}
        label={
          (value && (toLabel?.(value) ?? value.format(fieldFormat))) || "n/a"
        }
        onClick={() => setOpen((prev) => !prev)}
        ref={triggerRef}
      />
      {onNext && (
        <IconButton
          onClick={() => {
            if (value) {
              setValue?.(onNext(value), { validationError: null });
            }
          }}
          disabled={!onNext || (!!value && isMaxDate?.(value))}
        >
          <NavigateNextIcon />
        </IconButton>
      )}
    </Grid>
  );
};
