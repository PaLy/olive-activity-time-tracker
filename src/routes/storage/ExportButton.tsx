import { Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { exportDB } from "../../data/Storage";
import { saveAs } from "file-saver";

export const ExportButton = () => {
  return (
    <Button
      variant={"outlined"}
      startIcon={<FileDownloadIcon />}
      onClick={async () => {
        const data = await exportDB();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "activities.json");
      }}
    >
      Export
    </Button>
  );
};
