import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { useMemo } from "react";
import { Outlet, ScrollRestoration } from "react-router";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { useWindowResize } from "./utils/Window";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ScrollMemoryContext } from "./components/ScrollMemory";
import { AppSnackbar } from "./components/AppSnackbar";
import { useTickingClock } from "./data/interval/Signals";

type Props = {
  queryClient: QueryClient;
};

function App(props: Props) {
  const { queryClient } = props;
  const theme = useTheme();
  useWindowResize();
  useTickingClock();

  const scrollMemory = new Map<string, number>();

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
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
    </QueryClientProvider>
  );
}

const useTheme = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: {
            // 800 from dark olive green #556B2F
            main: "#778d3e",
          },
        },
      }),
    [prefersDarkMode],
  );
};

export default App;
