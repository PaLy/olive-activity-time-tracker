import {
  BaseSingleInputFieldProps,
  DatePicker,
  DatePickerProps,
  FieldSection,
} from "@mui/x-date-pickers";
import { Moment } from "moment";
import { Chip, Grid, IconButton } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Signal, useSignal } from "@preact/signals-react";

export type ChipDatePickerProps = Omit<
  DatePickerProps<Moment>,
  "value" | "onChange" | "onClose" | "onOpen" | "open" | "slots" | "slotProps"
> & {
  value: Signal<Moment>;
  isMaxDate?: (value: Moment) => boolean;
  onBefore?: (value: Moment) => Moment;
  onNext?: (value: Moment) => Moment;
  toLabel?: (value: Moment) => string;
};

export const ChipDatePicker = (props: ChipDatePickerProps) => {
  const { value, isMaxDate, onBefore, onNext, toLabel, ...datePickerProps } =
    props;
  const open = useSignal(false);
  const onOpen = () => (open.value = true);
  const onClose = () => (open.value = false);

  return (
    <DatePicker
      value={value.value}
      onChange={(newValue) => {
        if (newValue) {
          value.value = newValue;
        }
      }}
      slots={{ field: MyChip }}
      // @ts-ignore
      slotProps={{ field: { onOpen, isMaxDate, onBefore, onNext, toLabel } }}
      open={open.value}
      onClose={onClose}
      onOpen={onOpen}
      {...datePickerProps}
    />
  );
};

const MyChip = (
  props: BaseSingleInputFieldProps<
    Moment | null,
    Moment,
    FieldSection,
    unknown
  > & {
    onOpen?: () => void;
    isMaxDate?: (value: Moment) => boolean;
    onBefore?: (value: Moment) => Moment;
    onNext?: (value: Moment) => Moment;
    toLabel?: (value: Moment) => string;
  },
) => {
  const {
    value,
    onOpen,
    InputProps: { ref } = {},
    inputProps: { "aria-label": ariaLabel } = {},
    format,
    id,
    onChange,
    isMaxDate,
    onBefore,
    onNext,
    toLabel,
  } = props;

  return (
    <Grid container alignItems={"center"} width={"initial"} minHeight={40}>
      {onBefore && (
        <IconButton
          onClick={() => {
            if (value) {
              onChange?.(onBefore(value), { validationError: null });
            }
          }}
          disabled={!onBefore}
        >
          <NavigateBeforeIcon />
        </IconButton>
      )}
      <Chip
        id={id}
        aria-label={ariaLabel}
        label={(value && (toLabel?.(value) ?? value.format(format))) || "n/a"}
        onClick={onOpen}
        ref={ref}
      />
      {onNext && (
        <IconButton
          onClick={() => {
            if (value) {
              onChange?.(onNext(value), { validationError: null });
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
