import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useRemoveActivityInterval } from "../../data/activity/Operations";
import { batch, signal } from "@preact/signals-react";
import { EditIntervalLoaderData } from "./EditInterval";
import { openSnackbar } from "../../components/AppSnackbar";
import { useNavigate } from "../Router";

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

  const { mutate: deleteActivityInterval } = useRemoveActivityInterval({
    onSuccess: () => {
      batch(() => {
        deleteIntervalConfirmationData.value = null;
        openSnackbar({ message: "Interval successfully deleted" });
      });
      navigate(-1);
    },
  });

  return (
    <>
      <DialogTitle>Are you sure you want to delete the interval?</DialogTitle>
      <DialogContent>You cannot undo this action.</DialogContent>
      <DialogActions>
        <Button
          autoFocus
          aria-label={"no"}
          onClick={() => (deleteIntervalConfirmationData.value = null)}
        >
          No
        </Button>
        <Button
          aria-label={"yes"}
          onClick={() => {
            deleteActivityInterval({
              activity: activity!,
              interval: interval!,
            });
          }}
        >
          Yes
        </Button>
      </DialogActions>
    </>
  );
};
