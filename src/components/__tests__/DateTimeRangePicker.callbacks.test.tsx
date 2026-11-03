import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { DateTimeRangePicker } from "../DateTimeRangePicker";
import dayjs from "../../utils/dayjs";

type MockPickerProps = {
  label?: string;
  onChange?: (value: unknown) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: string | null) => void;
  slotProps?: { textField?: { helperText?: string } };
};

vi.mock("@mui/x-date-pickers/DateTimePicker", () => ({
  DateTimePicker: (props: MockPickerProps) => (
    <div>
      <span>{props.label}</span>
      <span>{props.slotProps?.textField?.helperText}</span>
      <button onClick={() => props.onChange?.(null)}>
        {`null ${props.label}`}
      </button>
      <button onClick={() => props.onChange?.({ value: true })}>
        {`change ${props.label}`}
      </button>
      <button onClick={props.onOpen}>{`open ${props.label}`}</button>
      <button onClick={props.onClose}>{`close ${props.label}`}</button>
      <button onClick={() => props.onError?.("disableFuture")}>
        {`future ${props.label}`}
      </button>
      <button onClick={() => props.onError?.("maxTime")}>
        {`max ${props.label}`}
      </button>
      <button onClick={() => props.onError?.("minTime")}>
        {`min ${props.label}`}
      </button>
      <button onClick={() => props.onError?.("invalidDate")}>
        {`invalid ${props.label}`}
      </button>
    </div>
  ),
}));

const defaultProps = () => ({
  startTime: dayjs().subtract(1, "hour"),
  startTimeError: "",
  endTime: dayjs(),
  endTimeError: "",
  omitEndTimePicker: false,
  setStartTime: vi.fn(),
  setStartTimeError: vi.fn(),
  setEndTime: vi.fn(),
  setEndTimeError: vi.fn(),
});

describe("DateTimeRangePicker callbacks", () => {
  it("updates the start time only for a valid value", async () => {
    const props = defaultProps();
    render(<DateTimeRangePicker {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "null Start" }));
    expect(props.setStartTime).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "change Start" }));
    expect(props.setStartTime).toHaveBeenCalledWith({ value: true });
  });

  it("updates the end time only for a valid value", async () => {
    const props = defaultProps();
    render(<DateTimeRangePicker {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "null End" }));
    expect(props.setEndTime).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "change End" }));
    expect(props.setEndTime).toHaveBeenCalledWith({ value: true });
  });

  it("opens and closes the start picker", async () => {
    const props = defaultProps();
    render(<DateTimeRangePicker {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "open Start" }));
    await userEvent.click(screen.getByRole("button", { name: "close Start" }));

    expect(screen.getByText("Start")).toBeVisible();
  });

  it("maps start errors to messages", async () => {
    const props = defaultProps();
    render(<DateTimeRangePicker {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "future Start" }));
    expect(props.setStartTimeError).toHaveBeenLastCalledWith(
      "Please select a past time",
    );

    await userEvent.click(screen.getByRole("button", { name: "max Start" }));
    expect(props.setStartTimeError).toHaveBeenLastCalledWith(
      "Please select a time before the end time",
    );

    await userEvent.click(
      screen.getByRole("button", { name: "invalid Start" }),
    );
    expect(props.setStartTimeError).toHaveBeenLastCalledWith("invalidDate");
  });

  it("allows a start time at the current end time when the end is omitted", async () => {
    const props = { ...defaultProps(), omitEndTimePicker: true };
    render(<DateTimeRangePicker {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "max Start" }));

    expect(props.setStartTimeError).toHaveBeenLastCalledWith(
      "Please select a past time",
    );
  });

  it("maps end errors to messages", async () => {
    const props = defaultProps();
    render(<DateTimeRangePicker {...props} />);

    await userEvent.click(screen.getByRole("button", { name: "future End" }));
    expect(props.setEndTimeError).toHaveBeenLastCalledWith(
      "Please select a past time",
    );

    await userEvent.click(screen.getByRole("button", { name: "min End" }));
    expect(props.setEndTimeError).toHaveBeenLastCalledWith(
      "Please select a time after the start time",
    );

    await userEvent.click(screen.getByRole("button", { name: "invalid End" }));
    expect(props.setEndTimeError).toHaveBeenLastCalledWith("invalidDate");
  });
});
