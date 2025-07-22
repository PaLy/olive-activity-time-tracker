import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useEffect } from "react";
import { create } from "zustand/index";
import { clearDB } from "../../db/exportImport";

type DeleteState = {
  step: "not-started" | "confirm" | "in-progress" | "result";
  error: string;
  reset: () => void;
  clearError: () => void;
  isSnackbarOpen: () => boolean;
  closeSnackbar: () => void;
  start: () => void;
  cancel: () => void;
  confirm: () => void;
  finish: () => void;
  setError: (error: string) => void;
};

const useDeleteStore = create<DeleteState>((set, get) => ({
  step: "not-started",
  error: "",
  reset: () => set({ step: "not-started", error: "" }),
  clearError: () => set({ error: "" }),
  closeSnackbar: () => set({ step: "not-started" }),
  isSnackbarOpen: () => get().step === "result",
  start: () => set({ step: "confirm" }),
  cancel: () => set({ step: "not-started" }),
  confirm: () => set({ step: "in-progress" }),
  finish: () => set({ step: "result" }),
  setError: (error: string) => set({ error }),
}));

export const DeleteDataButton = () => {
  const start = useDeleteStore((state) => state.start);
  return (
    <>
      <Button
        variant={"text"}
        color={"error"}
        startIcon={<DeleteForeverIcon />}
        onClick={start}
      >
        Delete data
      </Button>
      <Confirmation />
      <Result />
    </>
  );
};

const Confirmation = () => {
  const step = useDeleteStore((state) => state.step);
  const cancel = useDeleteStore((state) => state.cancel);
  const confirm = useDeleteStore((state) => state.confirm);
  const finish = useDeleteStore((state) => state.finish);
  const setError = useDeleteStore((state) => state.setError);
  return (
    <Dialog open={step === "confirm"}>
      <DialogTitle>
        Are you sure you want to delete all the data forever?
      </DialogTitle>
      <DialogContent>You cannot undo this action.</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={cancel}>
          No
        </Button>
        <Button
          onClick={async () => {
            confirm();
            clearDB()
              .catch((e) => {
                console.error(e);
                setError("Failed to delete data");
              })
              .then(finish);
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Result = () => {
  const error = useDeleteStore((state) => state.error);
  const reset = useDeleteStore((state) => state.reset);
  const clearError = useDeleteStore((state) => state.clearError);
  const closeSnackbar = useDeleteStore((state) => state.closeSnackbar);
  const isSnackbarOpen = useDeleteStore((state) => state.isSnackbarOpen);

  useEffect(() => {
    return reset;
  }, [reset]);

  return (
    <Snackbar
      open={isSnackbarOpen()}
      autoHideDuration={6000}
      onClose={closeSnackbar}
      TransitionProps={{ onExited: clearError }}
    >
      <Alert
        onClose={closeSnackbar}
        severity={error ? "error" : "success"}
        sx={{ width: "100%" }}
      >
        {error || "Data successfully deleted"}
      </Alert>
    </Snackbar>
  );
};
