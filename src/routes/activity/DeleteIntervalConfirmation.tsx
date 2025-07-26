import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "../Router";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { useActivityStore } from "./Store";
import { deleteInterval } from "../../db/queries/editInterval";

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
  const { intervalId } = deleteIntervalConfirmationData ?? {};
  const openSuccessSnackbar = useAppSnackbarStore((state) => state.openSuccess);
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  const navigate = useNavigate();

  const yesDelete = () => {
    closeDeleteIntervalConfirmation();
    navigate(-1);
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
        <Button
          autoFocus
          aria-label={"no"}
          onClick={closeDeleteIntervalConfirmation}
        >
          No
        </Button>
        <Button aria-label={"yes"} onClick={yesDelete}>
          Yes
        </Button>
      </DialogActions>
    </>
  );
};
