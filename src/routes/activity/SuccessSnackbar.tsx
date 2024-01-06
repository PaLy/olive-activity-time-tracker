import { signal } from "@preact/signals-react";
import { Alert, Snackbar } from "@mui/material";

export const successSnackbarOpen = signal(false);
export const successSnackbarMessage = signal("");

export const SuccessSnackbar = () => (
  <Snackbar
    open={successSnackbarOpen.value}
    autoHideDuration={6000}
    onClose={() => (successSnackbarOpen.value = false)}
    TransitionProps={{ onExited: () => (successSnackbarMessage.value = "") }}
  >
    <Alert
      onClose={() => (successSnackbarOpen.value = false)}
      severity={"success"}
      sx={{ width: "100%" }}
    >
      {successSnackbarMessage}
    </Alert>
  </Snackbar>
);
