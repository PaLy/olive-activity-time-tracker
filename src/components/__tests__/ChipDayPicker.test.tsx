import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ChipDayPicker } from "../ChipDayPicker";
import dayjs from "../../utils/dayjs";

describe("ChipDayPicker", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {component}
      </LocalizationProvider>,
    );
  };

  it("renders with calendar time label", () => {
    const value = dayjs("2024-01-15");
    const onChange = vi.fn();

    const { getByText } = renderWithProvider(
      <ChipDayPicker value={value} onChange={onChange} />,
    );

    // Should display the formatted date
    expect(getByText("Mon, Jan 15, 2024")).toBeInTheDocument();
  });

  it("passes through other props to ChipDatePicker", () => {
    const value = dayjs("2024-01-15");
    const onChange = vi.fn();
    const onBefore = vi.fn().mockReturnValue(dayjs("2024-01-14"));
    const onNext = vi.fn().mockReturnValue(dayjs("2024-01-16"));

    const { getByText } = renderWithProvider(
      <ChipDayPicker
        value={value}
        onChange={onChange}
        onBefore={onBefore}
        onNext={onNext}
      />,
    );

    // Component should render without errors
    expect(getByText("Mon, Jan 15, 2024")).toBeInTheDocument();
  });
});
