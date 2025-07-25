import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { useContext, useMemo } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { ScrollMemoryContext } from "./components/ScrollMemory";
import { AppSnackbar } from "./components/AppSnackbar";
import { TestThemeContext } from "./Theme";
import { useTickingClock } from "./utils/clock";

function App() {
  const theme = useTheme();
  useTickingClock();

  const scrollMemory = new Map<string, number>();

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ScrollRestoration />
        <ScrollMemoryContext.Provider value={scrollMemory}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Container
              maxWidth={"sm"}
              style={{ height: "100%", position: "relative" }}
              disableGutters
            >
              <Outlet />
            </Container>
          </Box>
        </ScrollMemoryContext.Provider>
        <AppSnackbar />
      </ThemeProvider>
    </LocalizationProvider>
  );
}

const useTheme = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { modifyTheme } = useContext(TestThemeContext);
  return useMemo(
    () =>
      createTheme(
        modifyTheme({
          palette: {
            mode: prefersDarkMode ? "dark" : "light",
            primary: {
              // 800 from dark olive green #556B2F
              main: "#778d3e",
            },
          },
        }),
      ),
    [modifyTheme, prefersDarkMode],
  );
};

export default App;
