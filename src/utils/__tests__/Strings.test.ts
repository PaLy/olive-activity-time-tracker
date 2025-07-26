import { describe, expect, it } from "vitest";
import { capitalize } from "../Strings";

describe("Strings", () => {
  describe("capitalize", () => {
    it("should capitalize the first letter of a lowercase string", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should keep the first letter capitalized if already uppercase", () => {
      expect(capitalize("Hello")).toBe("Hello");
    });

    it("should handle single character strings", () => {
      expect(capitalize("a")).toBe("A");
      expect(capitalize("A")).toBe("A");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("should only capitalize the first letter and keep the rest unchanged", () => {
      expect(capitalize("hELLO")).toBe("HELLO");
      expect(capitalize("hello WORLD")).toBe("Hello WORLD");
    });

    it("should handle strings with numbers and special characters", () => {
      expect(capitalize("123abc")).toBe("123abc");
      expect(capitalize("@hello")).toBe("@hello");
    });
  });
});
