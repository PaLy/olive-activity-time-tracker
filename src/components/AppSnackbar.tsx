import { Alert, Snackbar } from "@mui/material";
import { useEffect } from "react";
import { useAppSnackbarStore } from "./AppSnackbarStore";

export const AppSnackbar = () => {
  const open = useAppSnackbarStore((state) => state.open);
  const severity = useAppSnackbarStore((state) => state.severity);
  const message = useAppSnackbarStore((state) => state.message);
  const reset = useAppSnackbarStore((state) => state.reset);
  const close = useAppSnackbarStore((state) => state.close);

  useEffect(() => {
    return reset;
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={close}
      TransitionProps={{
        onExited: reset,
      }}
    >
      <Alert onClose={close} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
