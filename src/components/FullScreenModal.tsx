import { Box, Container, Modal, Paper, Slide } from "@mui/material";
import { ReactElement } from "react";

type Props = {
  open: boolean;
  children: ReactElement;
};

export const FullScreenModal = (props: Props) => {
  const { children, open } = props;
  return (
    <Modal open={open}>
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Container maxWidth={"sm"} style={{ height: "100%" }} disableGutters>
          <Paper square sx={{ pt: 1, pb: 1, height: "100%" }}>
            <Box sx={{ height: "100%", overflow: "auto" }}>{children}</Box>
          </Paper>
        </Container>
      </Slide>
    </Modal>
  );
};
