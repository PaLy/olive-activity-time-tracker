import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useRemoveActivityInterval } from "../../data/activity/Operations";
import { useNavigate } from "../Router";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { useActivityStore } from "./Store";

export const DeleteIntervalConfirmation = () => {
  const open = useActivityStore((state) =>
    state.isDeleteIntervalConfirmationOpen(),
  );
  return (
    <Dialog open={open}>
      <Content />
    </Dialog>
  );
};

const Content = () => {
  const closeDeleteIntervalConfirmation = useActivityStore(
    (state) => state.closeDeleteIntervalConfirmation,
  );
  const deleteIntervalConfirmationData = useActivityStore(
    (state) => state.deleteIntervalConfirmationData,
  );
  const { activity, interval } = deleteIntervalConfirmationData ?? {};
  const openSuccessSnackbar = useAppSnackbarStore((state) => state.openSuccess);
  const navigate = useNavigate();

  const { mutate: deleteActivityInterval } = useRemoveActivityInterval({
    onSuccess: () => {
      closeDeleteIntervalConfirmation();
      openSuccessSnackbar("Interval successfully deleted");
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
          onClick={closeDeleteIntervalConfirmation}
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
