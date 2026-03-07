import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDarkMode, TestThemeContext } from "../Theme";

describe("Theme", () => {
  describe("useDarkMode", () => {
    it("returns boolean value", () => {
      const { result } = renderHook(() => useDarkMode());

      // The hook should return a boolean
      expect(typeof result.current).toBe("boolean");
    });
  });

  describe("TestThemeContext", () => {
    it("has default modifyTheme function", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contextValue = (TestThemeContext as any)._currentValue;
      expect(contextValue).toBeDefined();
      expect(contextValue.modifyTheme).toBeDefined();
    });

    it("modifyTheme returns theme unchanged by default", () => {
      const testTheme = { palette: { primary: { main: "#000" } } };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (TestThemeContext as any)._currentValue.modifyTheme(
        testTheme,
      );
      expect(result).toEqual(testTheme);
    });
  });
});
