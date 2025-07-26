import { describe, expect, it } from "vitest";
import { capitalize, getInitials } from "../strings";

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

  describe("getInitials", () => {
    it("should return initials from first and last name", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("Jane Smith")).toBe("JS");
    });

    it("should handle single name", () => {
      expect(getInitials("John")).toBe("J");
    });

    it("should take first two significant words when there are more than two", () => {
      expect(getInitials("John Michael Doe")).toBe("JM");
      expect(getInitials("Mary Jane Watson Smith")).toBe("MJ");
    });

    it("should skip prepositions and take meaningful words", () => {
      expect(getInitials("John of the North")).toBe("JN");
      expect(getInitials("Mary and the Machine")).toBe("MM");
    });

    it("should handle all prepositions correctly", () => {
      expect(getInitials("House of Cards")).toBe("HC");
      expect(getInitials("Lord of the Rings")).toBe("LR");
      expect(getInitials("Beauty and the Beast")).toBe("BB");
      expect(getInitials("Alice in Wonderland")).toBe("AW");
      expect(getInitials("Knight at the Round Table")).toBe("KR");
      expect(getInitials("Game or Thrones")).toBe("GT");
      expect(getInitials("Lord a the Manor")).toBe("LM");
    });

    it("should skip special characters and symbols", () => {
      expect(getInitials("John & Jane")).toBe("JJ");
      expect(getInitials("Smith + Associates")).toBe("SA");
      expect(getInitials("Alpha - Beta")).toBe("AB");
      expect(getInitials("Rock & Roll")).toBe("RR");
    });

    it("should handle mixed prepositions and symbols", () => {
      expect(getInitials("John & Sons of America")).toBe("JS");
      expect(getInitials("Smith + Associates in Law")).toBe("SA");
    });

    it("should return uppercase initials", () => {
      expect(getInitials("john doe")).toBe("JD");
      expect(getInitials("JANE SMITH")).toBe("JS");
      expect(getInitials("mIxEd CaSe")).toBe("MC");
    });

    it("should handle empty string", () => {
      expect(getInitials("")).toBe("");
    });

    it("should handle strings with only spaces", () => {
      expect(getInitials("   ")).toBe("");
    });

    it("should handle strings with only prepositions", () => {
      expect(getInitials("and or the")).toBe("AO");
    });

    it("should handle strings with only symbols", () => {
      expect(getInitials("& + -")).toBe("&+");
    });

    it("should handle names with numbers", () => {
      expect(getInitials("John 2nd")).toBe("J2");
      expect(getInitials("Company 123 Corp")).toBe("C1");
    });

    it("should handle complex real-world names", () => {
      expect(getInitials("Jean-Baptiste Grenouille")).toBe("JG");
      expect(getInitials("Mary-Jane Watson")).toBe("MW");
      expect(getInitials("Sir Arthur Conan Doyle")).toBe("SA");
    });

    it("should limit to first two meaningful words even with many words", () => {
      expect(getInitials("The Lord of the Rings and the Fellowship")).toBe(
        "LR",
      );
      expect(getInitials("A Very Long Company Name With Many Words")).toBe(
        "VL",
      );
    });

    it("should handle single character words", () => {
      expect(getInitials("A B")).toBe("AB");
      expect(getInitials("X Y Z")).toBe("XY");
    });
  });
});
