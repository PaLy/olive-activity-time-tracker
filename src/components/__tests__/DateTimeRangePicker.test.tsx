import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DateTimeRangePicker } from "../DateTimeRangePicker";
import dayjs from "../../utils/dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ReactNode } from "react";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    {children}
  </LocalizationProvider>
);

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

describe("DateTimeRangePicker", () => {
  it("renders start and end pickers when omitEndTimePicker is false", () => {
    const props = defaultProps();
    render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
    // Both pickers render labels
    const labels = screen.getAllByText("Start");
    expect(labels.length).toBeGreaterThanOrEqual(1);
    const endLabels = screen.getAllByText("End");
    expect(endLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("hides end picker when omitEndTimePicker is true", () => {
    const props = defaultProps();
    props.omitEndTimePicker = true;
    render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
    expect(screen.getAllByText("Start").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("End")).not.toBeInTheDocument();
  });

  it("displays startTimeError as helper text", () => {
    const props = defaultProps();
    props.startTimeError = "Start error message";
    render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
    expect(screen.getByText("Start error message")).toBeInTheDocument();
  });

  it("displays endTimeError as helper text", () => {
    const props = defaultProps();
    props.endTimeError = "End error message";
    render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
    expect(screen.getByText("End error message")).toBeInTheDocument();
  });

  describe("start picker onError - disableFuture", () => {
    it("calls setStartTimeError with past time message for future startTime", () => {
      const props = defaultProps();
      props.startTime = dayjs().add(1, "day");
      render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
      expect(props.setStartTimeError).toHaveBeenCalledWith(
        "Please select a past time",
      );
    });
  });

  describe("start picker onError - maxTime with omitEndTimePicker true", () => {
    it("sets past time error for future start with omitEndTimePicker", () => {
      const props = defaultProps();
      props.omitEndTimePicker = true;
      props.startTime = dayjs().add(1, "day");
      render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
      expect(props.setStartTimeError).toHaveBeenCalledWith(
        "Please select a past time",
      );
    });
  });

  describe("start picker onError - maxTime without omitEndTimePicker", () => {
    it("sets before end time error when startTime is after endTime", () => {
      const props = defaultProps();
      props.omitEndTimePicker = false;
      props.startTime = dayjs().subtract(10, "minute");
      props.endTime = dayjs().subtract(1, "hour");
      render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
      expect(props.setStartTimeError).toHaveBeenCalledWith(
        "Please select a time before the end time",
      );
    });
  });

  describe("end picker onError - disableFuture", () => {
    it("sets past time error for future endTime", () => {
      const props = defaultProps();
      props.endTime = dayjs().add(1, "day");
      render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
      expect(props.setEndTimeError).toHaveBeenCalledWith(
        "Please select a past time",
      );
    });
  });

  describe("end picker onError - minTime", () => {
    it("sets after start time error when endTime is before startTime", () => {
      const props = defaultProps();
      props.startTime = dayjs().subtract(30, "minute");
      props.endTime = dayjs().subtract(1, "hour");
      render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
      expect(props.setEndTimeError).toHaveBeenCalledWith(
        "Please select a time after the start time",
      );
    });
  });

  it("does not call error setters for valid times (no error triggered)", () => {
    const props = defaultProps();
    props.startTime = dayjs().subtract(2, "hour");
    props.endTime = dayjs().subtract(1, "hour");
    render(<DateTimeRangePicker {...props} />, { wrapper: Wrapper });
    // MUI does not call onError when there is no error, so these should not be called
    expect(props.setStartTimeError).not.toHaveBeenCalled();
    expect(props.setEndTimeError).not.toHaveBeenCalled();
  });
});
