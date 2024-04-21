import { Alert, Button, Snackbar } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { exportDB } from "../../data/Storage";
import { saveAs } from "file-saver";
import { signal } from "@preact/signals-react";
import moment from "moment";
import { useEffect } from "react";
import { openErrorSnackbar } from "../../components/AppSnackbar";

export const ExportButton = () => {
  return (
    <>
      <Button
        variant={"outlined"}
        startIcon={<FileDownloadIcon />}
        onClick={async () => {
          // TODO warning about in-progress activities
          try {
            const json = await exportDB();
            const dateTime = moment().format("YYYYMMDDHHmm");
            const filename = `activities_${dateTime}.json`;
            if (window.Android) {
              const result = window.Android.export(json, filename);
              if (result === "error") {
                androidError.value = true;
              }
            } else {
              const blob = new Blob([json], {
                type: "application/json;charset=utf-8",
              });
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

const androidError = signal(false);

const AndroidError = () => {
  useEffect(() => {
    return () => {
      androidError.value = false;
    };
  }, []);

  return (
    <Snackbar
      open={androidError.value}
      autoHideDuration={6000}
      onClose={() => (androidError.value = false)}
    >
      <Alert
        onClose={() => (androidError.value = false)}
        severity={"error"}
        sx={{ width: "100%" }}
      >
        Failed to export
      </Alert>
    </Snackbar>
  );
};
