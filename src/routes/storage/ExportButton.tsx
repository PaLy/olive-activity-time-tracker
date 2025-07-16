import { Alert, Button, Snackbar } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { saveAs } from "file-saver";
import moment from "moment";
import { useEffect } from "react";
import { create } from "zustand/index";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";
import { exportDB } from "../../db/exportImport";

export const ExportButton = () => {
  const setAndroidError = useExportStore((state) => state.setAndroidError);
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  return (
    <>
      <Button
        variant={"outlined"}
        startIcon={<FileDownloadIcon />}
        onClick={async () => {
          // TODO warning about in-progress activities
          try {
            const blob = await exportDB();
            const dateTime = moment().format("YYYYMMDDHHmm");
            const filename = `activities_${dateTime}.json`;
            if (window.Android) {
              const result = window.Android.export(await blob.text(), filename);
              if (result === "error") {
                setAndroidError();
              }
            } else {
              saveAs(blob, filename);
            }
          } catch (error) {
            console.error(error);
            openErrorSnackbar("Failed to export data.");
          }
        }}
      >
        Export
      </Button>
      {window.Android && <AndroidError />}
    </>
  );
};

type ExportStore = {
  androidError: boolean;
  setAndroidError: () => void;
  clearAndroidError: () => void;
};

const useExportStore = create<ExportStore>((set) => ({
  androidError: false,
  setAndroidError: () => set({ androidError: true }),
  clearAndroidError: () => set({ androidError: false }),
}));

const AndroidError = () => {
  const androidError = useExportStore((state) => state.androidError);
  const clearAndroidError = useExportStore((state) => state.clearAndroidError);

  useEffect(() => {
    return clearAndroidError;
  }, [clearAndroidError]);

  return (
    <Snackbar
      open={androidError}
      autoHideDuration={6000}
      onClose={clearAndroidError}
    >
      <Alert
        onClose={clearAndroidError}
        severity={"error"}
        sx={{ width: "100%" }}
      >
        Failed to export
      </Alert>
    </Snackbar>
  );
};
