import { Alert, Button, Snackbar } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { exportDB } from "../../data/Storage";
import { saveAs } from "file-saver";
import { signal } from "@preact/signals-react";

export const ExportButton = () => {
  return (
    <>
      <Button
        variant={"outlined"}
        startIcon={<FileDownloadIcon />}
        onClick={async () => {
          // TODO warning about in-progress activities
          const data = await exportDB();
          const json = JSON.stringify(data, null, 2);
          const filename = "activities.json";
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
        }}
      >
        Export
      </Button>
      {window.Android && <AndroidError />}
    </>
  );
};

const androidError = signal(false);

const AndroidError = () => (
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
