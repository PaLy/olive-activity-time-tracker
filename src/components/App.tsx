import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useContext, useMemo, Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CircularProgress from "@mui/material/CircularProgress";
import { ScrollMemoryContext } from "./ScrollMemory";
import { AppSnackbar } from "./AppSnackbar";
import { TestThemeContext } from "./Theme";
import { useTickingClock } from "../utils/clock";
import { useInProgressActivitiesNotifications } from "../hooks/useInProgressActivitiesNotifications";

function App() {
  const theme = useTheme();
  useTickingClock();

  useInProgressActivitiesNotifications();

  const scrollMemory = new Map<string, number>();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              <Suspense
                fallback={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100vh",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                }
              >
                <Outlet />
              </Suspense>
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
