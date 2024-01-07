import { ChipDatePicker, ChipDatePickerProps } from "./ChipDatePicker";

type Props = Omit<ChipDatePickerProps, "toLabel">;

export const ChipDayPicker = (props: Props) => {
  return (
    <ChipDatePicker
      {...props}
      toLabel={(value) =>
        value?.calendar(null, {
          lastDay: "[Yesterday]",
          sameDay: "[Today]",
          nextDay: "[Tomorrow]",
          lastWeek: "[last] dddd",
          nextWeek: "dddd",
          sameElse: "ddd, MMM D, YYYY",
        })
      }
    />
  );
};
