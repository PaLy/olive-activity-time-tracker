import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { deleteActivityInterval } from "../../data/activity/Update";
import { batch, signal } from "@preact/signals-react";
import { successSnackbarMessage, successSnackbarOpen } from "./SuccessSnackbar";
import { EditIntervalLoaderData } from "./EditInterval";

export const deleteIntervalConfirmationData =
  signal<EditIntervalLoaderData | null>(null);

export const DeleteIntervalConfirmation = () => (
  <Dialog open={deleteIntervalConfirmationData.value !== null}>
    <Content />
  </Dialog>
);

const Content = () => {
  const { activity, interval } = deleteIntervalConfirmationData.value ?? {};
  const navigate = useNavigate();

  return (
    <>
      <DialogTitle>Are you sure you want to delete the interval?</DialogTitle>
      <DialogContent>You cannot undo this action.</DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={() => (deleteIntervalConfirmationData.value = null)}
        >
          No
        </Button>
        <Button
          onClick={() => {
            batch(() => {
              deleteActivityInterval(activity!, interval!);
              deleteIntervalConfirmationData.value = null;
              successSnackbarOpen.value = true;
              successSnackbarMessage.value = "Interval successfully deleted";
            });
            navigate(-1);
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </>
  );
};
