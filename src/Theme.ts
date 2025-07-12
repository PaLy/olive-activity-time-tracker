import { createContext } from "react";
import { createTheme } from "@mui/material";

export type ThemeOptions = Parameters<typeof createTheme>[0];

export type TestThemeContextType = {
  modifyTheme: (theme: ThemeOptions) => ThemeOptions;
};

export const TestThemeContext = createContext<TestThemeContextType>({
  modifyTheme: (theme) => theme,
});
