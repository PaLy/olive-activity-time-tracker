import { ChipDatePicker, ChipDatePickerProps } from "./ChipDatePicker";
import { calendarTime } from "../utils/date";

type Props = Omit<ChipDatePickerProps, "toLabel">;

export const ChipDayPicker = (props: Props) => {
  return <ChipDatePicker {...props} toLabel={calendarTime} />;
};
