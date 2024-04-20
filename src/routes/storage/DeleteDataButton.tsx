import { signal } from "@preact/signals-react";
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
import { clearDB } from "../../data/Storage";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const deleteFlowStep = signal<
  "not-started" | "confirm" | "in-progress" | "result"
>("not-started");
const deleteError = signal("");
const closeDeleteSnackbar = () => (deleteFlowStep.value = "not-started");

export const DeleteDataButton = () => {
  return (
    <>
      <Button
        variant={"text"}
        color={"error"}
        startIcon={<DeleteForeverIcon />}
        onClick={() => (deleteFlowStep.value = "confirm")}
      >
        Delete data
      </Button>
      <Confirmation />
      <Result />
    </>
  );
};

const Confirmation = () => {
  const queryClient = useQueryClient();
  return (
    <Dialog open={deleteFlowStep.value === "confirm"}>
      <DialogTitle>
        Are you sure you want to delete all the data forever?
      </DialogTitle>
      <DialogContent>You cannot undo this action.</DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={() => (deleteFlowStep.value = "not-started")}
        >
          No
        </Button>
        <Button
          onClick={async () => {
            deleteFlowStep.value = "in-progress";
            await clearDB()
              .catch((e) => (deleteError.value = "Failed to delete data"))
              .then(() => (deleteFlowStep.value = "result"));
            await queryClient.invalidateQueries();
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Result = () => {
  useEffect(() => {
    return () => {
      closeDeleteSnackbar();
      deleteError.value = "";
    };
  }, []);

  return (
    <Snackbar
      open={deleteFlowStep.value === "result"}
      autoHideDuration={6000}
      onClose={closeDeleteSnackbar}
      TransitionProps={{ onExited: () => (deleteError.value = "") }}
    >
      <Alert
        onClose={closeDeleteSnackbar}
        severity={deleteError.value ? "error" : "success"}
        sx={{ width: "100%" }}
      >
        {deleteError.value || "Data successfully deleted"}
      </Alert>
    </Snackbar>
  );
};
