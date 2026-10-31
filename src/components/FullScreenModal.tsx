import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import { ReactElement } from "react";

type Props = {
  open: boolean;
  children: ReactElement;
};

export const modalSlotProps = {
  // The backdrop is animated (faded) by view transitions on its own
  backdrop: {
    transitionDuration: 0,
    style: { viewTransitionName: "modal-backdrop" },
  },
};

export const FullScreenModal = (props: Props) => {
  const { children, open } = props;
  return (
    <Modal open={open} slotProps={modalSlotProps}>
      <Container
        maxWidth={"sm"}
        style={{
          height: "100%",
          viewTransitionName: "fullscreen-modal",
        }}
        disableGutters
      >
        <Paper
          square
          sx={{
            paddingTop: "calc(env(safe-area-inset-top) + 8px)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
            height: "100%",
          }}
        >
          <Box sx={{ height: "100%", overflow: "auto" }}>{children}</Box>
        </Paper>
      </Container>
    </Modal>
  );
};
