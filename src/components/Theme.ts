import { createContext } from "react";
import { createTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export type ThemeOptions = Parameters<typeof createTheme>[0];

export type TestThemeContextType = {
  modifyTheme: (theme: ThemeOptions) => ThemeOptions;
};

export const TestThemeContext = createContext<TestThemeContextType>({
  modifyTheme: (theme) => theme,
});

export const useDarkMode = (): boolean => {
  return useMediaQuery("(prefers-color-scheme: dark)");
};
