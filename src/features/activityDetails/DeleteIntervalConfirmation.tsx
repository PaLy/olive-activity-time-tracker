import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "../../router/hooks";
import { useHistoryDialog } from "../../router/useHistoryDialog";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { useActivityStore } from "./Store";
import { deleteInterval } from "../../db/queries/editInterval";

export const DELETE_INTERVAL_DIALOG_KEY = "deleteIntervalConfirmation";

export const DeleteIntervalConfirmation = () => {
  const storeOpen = useActivityStore((state) =>
    state.isDeleteIntervalConfirmationOpen(),
  );
  const { isOpen, close } = useHistoryDialog(DELETE_INTERVAL_DIALOG_KEY);
  return (
    <Dialog open={storeOpen && isOpen} onClose={close}>
      <Content close={close} />
    </Dialog>
  );
};

const Content = ({ close }: { close: () => void }) => {
  const deleteIntervalConfirmationData = useActivityStore(
    (state) => state.deleteIntervalConfirmationData,
  );
  const { intervalId } = deleteIntervalConfirmationData ?? {};
  const openSuccessSnackbar = useAppSnackbarStore((state) => state.openSuccess);
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const navigate = useNavigate();

  const yesDelete = () => {
    // Close both the dialog and the edit interval view.
    navigate(-2);
    deleteInterval(intervalId!)
      .then(() => {
        openSuccessSnackbar("Interval successfully deleted");
      })
      .catch(() => openErrorSnackbar("Failed to delete interval"));
  };

  return (
    <>
      <DialogTitle>Are you sure you want to delete the interval?</DialogTitle>
      <DialogContent>You cannot undo this action.</DialogContent>
      <DialogActions>
        <Button autoFocus aria-label={"no"} onClick={close}>
          No
        </Button>
        <Button aria-label={"yes"} onClick={yesDelete}>
          Yes
        </Button>
      </DialogActions>
    </>
  );
};
