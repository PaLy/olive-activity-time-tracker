import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { useMemo } from "react";
import { AppBottomNavigation } from "./BottomNavigation";
import { AppAppBar } from "./AppBar";
import { Outlet } from "react-router-dom";

function App() {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth={"sm"}
        style={{ height: "100%", position: "relative" }}
      >
        <AppAppBar />
        <Outlet />
        <AppBottomNavigation />
      </Container>
    </ThemeProvider>
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
            main: "#556B2F",
          },
        },
      }),
    [prefersDarkMode],
  );
};

export default App;
