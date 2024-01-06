import { Box, Grid, Typography } from "@mui/material";
import { FullScreenModal } from "../../components/FullScreenModal";
import { FullScreenModalContent } from "../../components/FullScreenModalContent";
import { useLocation } from "../Router";
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
    <FullScreenModalContent headline={"Storage"}>
      <Grid
        container
        sx={{ p: 1, height: "calc(100% - 56px);" }}
        direction={"column"}
        justifyContent={"space-between"}
      >
        <Box sx={{ ml: 1, mr: 1 }}>
          <Typography variant={"body1"}>
            All the data is stored only on your device.
          </Typography>
          <Typography variant={"body1"}>
            It is recommended to regularly back up your data.
          </Typography>
          <Grid container justifyContent={"space-evenly"} sx={{ mt: 4 }}>
            <ExportButton />
            <ImportButton />
          </Grid>
        </Box>
        <Grid container justifyContent={"center"}>
          <DeleteDataButton />
        </Grid>
      </Grid>
    </FullScreenModalContent>
  );
};
