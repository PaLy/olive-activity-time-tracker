import { signal } from "@preact/signals-react";
import { Alert, Snackbar } from "@mui/material";
import { useEffect } from "react";

export const successSnackbarOpen = signal(false);
export const successSnackbarMessage = signal("");

export const SuccessSnackbar = () => {
  useEffect(() => {
    return () => {
      successSnackbarOpen.value = false;
      successSnackbarMessage.value = "";
    };
  }, []);

  return (
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
};
