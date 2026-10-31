import { describe, expect, it } from "vitest";
import { getIdColor } from "../color";

describe("getIdColor", () => {
  it("is deterministic", () => {
    expect(getIdColor(5)).toBe(getIdColor(5));
  });

  it("gives different colors to many consecutive ids", () => {
    const colors = new Set(
      Array.from({ length: 100 }, (_, i) => getIdColor(i + 1)),
    );
    expect(colors.size).toBe(100);
  });
});
