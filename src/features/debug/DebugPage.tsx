import { Console } from "console-feed";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FullScreenModal } from "../../components/FullScreenModal";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import { useLocation } from "../../router/hooks";
import { useDebugStore } from "./DebugStore";
import { useDarkMode } from "../../components/Theme";

export const DebugPage = () => {
  const { pathname } = useLocation();
  return (
    <FullScreenModal open={pathname.endsWith("/debug")}>
      <Content />
    </FullScreenModal>
  );
};

const Content = () => {
  const logs = useDebugStore((state) => state.logs);
  const totalLogs = useDebugStore((state) => state.totalLogs);
  const clearLogs = useDebugStore((state) => state.clearLogs);
  const darkMode = useDarkMode();

  return (
    <Box sx={{ height: "100%" }}>
      <FullScreenModalHeader
        headline="Debug Console"
        finishButtonProps={{
          children: "Clear",
          onClick: clearLogs,
          variant: "outlined",
          size: "small",
        }}
      />
      <Box sx={{ p: 2, height: "calc(100vh - 72px)", overflow: "hidden" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Console logs appear below. Only the last 1000 logs are displayed.
          Total logs: {totalLogs}
        </Typography>
        <Box
          sx={{
            height: "calc(100% - 40px)",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            overflow: "auto",
            backgroundColor: "background.paper",
          }}
        >
          <Console logs={logs} variant={darkMode ? "dark" : "light"} />
        </Box>
      </Box>
    </Box>
  );
};
