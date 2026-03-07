import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ChipDatePicker, ChipDatePickerProps } from "../ChipDatePicker";
import dayjs from "../../utils/dayjs";

describe("ChipDatePicker", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {component}
      </LocalizationProvider>,
    );
  };

  it("renders with default props", () => {
    const value = dayjs("2024-01-15");
    const onChange = vi.fn();

    const { container } = renderWithProvider(
      <ChipDatePicker value={value} onChange={onChange} />,
    );

    expect(container).toBeTruthy();
  });

  it("passes through props to DatePicker", () => {
    const value = dayjs("2024-01-15");
    const onChange = vi.fn();
    const label = "Select Date";

    const { getByText } = renderWithProvider(
      <ChipDatePicker value={value} onChange={onChange} label={label} />,
    );

    // Should render without errors
    expect(getByText("01/15/2024")).toBeInTheDocument();
  });

  it("displays the formatted date value", () => {
    const value = dayjs("2024-03-20");
    const onChange = vi.fn();

    renderWithProvider(<ChipDatePicker value={value} onChange={onChange} />);

    expect(screen.getByText("03/20/2024")).toBeInTheDocument();
  });

  it("renders with custom label using toLabel prop", () => {
    const value = dayjs("2024-01-15");
    const onChange = vi.fn();
    const toLabel = vi.fn((d) => `Custom: ${d.format("YYYY-MM-DD")}`);

    renderWithProvider(
      <ChipDatePicker value={value} onChange={onChange} toLabel={toLabel} />,
    );

    expect(screen.getByText("Custom: 2024-01-15")).toBeInTheDocument();
    expect(toLabel).toHaveBeenCalledWith(value);
  });

  it("renders with custom label", () => {
    const value = dayjs("2024-01-15");
    const onChange = vi.fn();

    renderWithProvider(
      <ChipDatePicker value={value} onChange={onChange} label="Custom Label" />,
    );

    expect(screen.getByText("01/15/2024")).toBeInTheDocument();
  });

  it("handles null value", () => {
    const onChange = vi.fn();

    const { container } = renderWithProvider(
      <ChipDatePicker
        value={null as unknown as ChipDatePickerProps["value"]}
        onChange={onChange}
      />,
    );

    expect(container).toBeTruthy();
    expect(screen.getByText("n/a")).toBeInTheDocument();
  });

  it("renders with onBefore and onNext navigation buttons", () => {
    const value = dayjs("2024-01-15");
    const onChange = vi.fn();
    const onBefore = vi.fn((d) => d.subtract(1, "day"));
    const onNext = vi.fn((d) => d.add(1, "day"));

    renderWithProvider(
      <ChipDatePicker
        value={value}
        onChange={onChange}
        onBefore={onBefore}
        onNext={onNext}
      />,
    );

    const buttons = screen.getAllByRole("button");
    // Should have 3 buttons: before, date chip, next
    expect(buttons.length).toBe(3);
  });

  it("disables next button when isMaxDate returns true", () => {
    const value = dayjs("2024-01-15");
    const onChange = vi.fn();
    const onBefore = vi.fn((d) => d.subtract(1, "day"));
    const onNext = vi.fn((d) => d.add(1, "day"));
    const isMaxDate = vi.fn(() => true);

    renderWithProvider(
      <ChipDatePicker
        value={value}
        onChange={onChange}
        onBefore={onBefore}
        onNext={onNext}
        isMaxDate={isMaxDate}
      />,
    );

    const buttons = screen.getAllByRole("button");
    // Last button should be the next button and should be disabled
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });
});
