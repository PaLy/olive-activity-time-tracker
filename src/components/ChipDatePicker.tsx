import {
  DatePicker,
  DatePickerFieldProps,
  DatePickerProps,
} from "@mui/x-date-pickers/DatePicker";
import { usePickerContext } from "@mui/x-date-pickers/hooks";
import { Dayjs } from "dayjs";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useDialog } from "../utils/dialog";

export type ChipDatePickerProps = Omit<
  DatePickerProps,
  "value" | "onChange" | "onClose" | "onOpen" | "open" | "slots" | "slotProps"
> & {
  value: Dayjs;
  onChange: (value: Dayjs) => void;
  isMaxDate?: (value: Dayjs) => boolean;
  onBefore?: (value: Dayjs) => Dayjs;
  onNext?: (value: Dayjs) => Dayjs;
  toLabel?: (value: Dayjs) => string;
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

  const { open, onOpen, onClose } = useDialog();

  return (
    <DatePicker
      value={value}
      onChange={(newValue) => {
        if (newValue) {
          onChange(newValue);
        }
      }}
      closeOnSelect={true}
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
  isMaxDate?: (value: Dayjs) => boolean;
  onBefore?: (value: Dayjs) => Dayjs;
  onNext?: (value: Dayjs) => Dayjs;
  toLabel?: (value: Dayjs) => string;
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
