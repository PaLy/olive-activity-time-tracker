import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { AppBottomNavigation } from "./BottomNavigation";
import { AppAppBar } from "./AppBar";
import { Outlet } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { signal } from "@preact/signals-react";
import { loadDB } from "./data/Storage";

function App() {
  const theme = useTheme();

  useLoadDB();
  if (!dbLoaded.value) {
    return "Loading";
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        >
          <Container
            maxWidth={"sm"}
            style={{ height: "100%", position: "relative" }}
            disableGutters
          >
            <AppAppBar />
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "64px",
                bottom: "56px",
              }}
            >
              <Outlet />
            </Box>
            <AppBottomNavigation />
          </Container>
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  );
}

const dbLoaded = signal(false);

const useLoadDB = () => {
  useEffect(() => {
    loadDB().then(() => (dbLoaded.value = true));
  }, []);
};

const useTheme = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: {
            main: "#556B2F",
          },
        },
      }),
    [prefersDarkMode],
  );
};

export default App;
