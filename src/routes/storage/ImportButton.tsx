import { Button } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";

export const ImportButton = () => {
  return (
    <Button
      variant={"outlined"}
      component="label"
      startIcon={<FileUploadIcon />}
      disabled={true} // not implemented
    >
      Import
      <input type="file" hidden accept={".json"} />
    </Button>
  );
};
