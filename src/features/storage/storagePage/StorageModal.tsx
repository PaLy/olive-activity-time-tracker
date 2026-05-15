import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { FullScreenModal } from "../../../components/FullScreenModal";
import { FullScreenModalHeader } from "../../../components/FullScreenModalHeader";
import { useLocation } from "../../../router/hooks";
import { DeleteDataButton } from "./DeleteDataButton";
import { ExportButton } from "./ExportButton";
import { ImportButton } from "./ImportButton";

export const StorageModal = () => {
  const { pathname } = useLocation();
  return (
    <FullScreenModal open={pathname.endsWith("/storage")}>
      <Content />
    </FullScreenModal>
  );
};

const Content = () => {
  return (
    <Grid
      container
      sx={{
        minHeight: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <FullScreenModalHeader headline={"Storage"} />
        <Grid container sx={{ p: 1, flexDirection: "column" }}>
          <Box sx={{ ml: 1, mr: 1 }}>
            <Typography variant={"body1"}>
              All the data is stored only on your device.
            </Typography>
            <Typography variant={"body1"}>
              It is recommended to regularly back up your data.
            </Typography>
            <Grid container sx={{ justifyContent: "space-evenly", mt: 4 }}>
              <ExportButton />
              <ImportButton />
            </Grid>
          </Box>
        </Grid>
      </Box>
      <Grid container sx={{ justifyContent: "center" }}>
        <DeleteDataButton />
      </Grid>
    </Grid>
  );
};
