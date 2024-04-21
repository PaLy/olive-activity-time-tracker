import { signal } from "@preact/signals-react";
import { Alert, Snackbar } from "@mui/material";
import { useEffect } from "react";
import { AlertColor } from "@mui/material/Alert/Alert";

export const AppSnackbar = () => {
  useEffect(() => {
    return () => {
      appSnackbarProps.value = defaultSnackbarProps;
    };
  }, []);

  return (
    <Snackbar
      open={appSnackbarProps.value.open}
      autoHideDuration={6000}
      onClose={onClose}
      TransitionProps={{
        onExited: () => (appSnackbarProps.value = defaultSnackbarProps),
      }}
    >
      <Alert
        onClose={onClose}
        severity={appSnackbarProps.value.severity}
        sx={{ width: "100%" }}
      >
        {appSnackbarProps.value.message}
      </Alert>
    </Snackbar>
  );
};

type SnackbarProps = {
  open: boolean;
  message: string;
  severity?: AlertColor;
};

const defaultSnackbarProps: SnackbarProps = { open: false, message: "" };

const appSnackbarProps = signal(defaultSnackbarProps);

const onClose = () => {
  appSnackbarProps.value = { ...appSnackbarProps.value, open: false };
};

export const openSnackbar = (options: Omit<SnackbarProps, "open">) => {
  appSnackbarProps.value = { ...options, open: true };
};

export const openErrorSnackbar = (error: Error) => {
  openSnackbar({ message: error.message, severity: "error" });
  console.error(error);
};

export const useOpenErrorSnackbar = (error: Error | null) => {
  useEffect(() => {
    if (error) {
      openErrorSnackbar(error);
    }
  }, [error]);
};
