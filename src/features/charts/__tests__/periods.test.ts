import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { getPeriodRange } from "../periods";

const NOW = dayjs("2026-11-11T15:30:00");

describe("getPeriodRange", () => {
  it("returns the last 7 days for the week", () => {
    const range = getPeriodRange("week", NOW);
    expect(dayjs(range.start).format("YYYY-MM-DD HH:mm")).toBe(
      "2026-11-05 00:00",
    );
    expect(range.end).toBe(NOW.endOf("day").valueOf());
    expect(range.bucketUnit).toBe("day");
  });

  it("returns the last 30 days for the month", () => {
    const range = getPeriodRange("month", NOW);
    expect(dayjs(range.start).format("YYYY-MM-DD HH:mm")).toBe(
      "2026-10-13 00:00",
    );
    expect(range.bucketUnit).toBe("day");
  });

  it("returns the last 12 months for the year", () => {
    const range = getPeriodRange("year", NOW);
    expect(dayjs(range.start).format("YYYY-MM-DD HH:mm")).toBe(
      "2025-12-01 00:00",
    );
    expect(range.bucketUnit).toBe("month");
  });
});
