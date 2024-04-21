import { Alert, Button, Snackbar } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ChangeEvent, useEffect } from "react";
import { importDB } from "../../data/Storage";
import { signal } from "@preact/signals-react";
import { useQueryClient } from "@tanstack/react-query";

export const ImportButton = () => {
  const handleFileChange = useHandleFileChange();
  return (
    <>
      <Button
        variant={"outlined"}
        component="label"
        startIcon={<FileUploadIcon />}
        aria-label={"Import"}
      >
        Import
        <input
          type="file"
          hidden
          accept={".json"}
          onChange={handleFileChange}
        />
      </Button>
      <Result />
    </>
  );
};

const useHandleFileChange = () => {
  const queryClient = useQueryClient();

  return async (event: ChangeEvent<HTMLInputElement>) => {
    resultOpen.value = false;
    const file = event.target.files?.[0];
    if (file) {
      const fileText = await file.text();
      try {
        const { valid, errors } = await importDB(fileText);
        if (!valid) {
          error.value = "Invalid JSON";
          console.error("Invalid JSON:", errors);
        }
        await queryClient.invalidateQueries();
      } catch (e) {
        console.error(e);
        // TODO delete data?
        error.value = "Something went wrong";
      }
    } else {
      error.value = "Invalid file";
    }
    resultOpen.value = true;
    event.target.value = "";
  };
};

const resultOpen = signal(false);
const error = signal("");

const Result = () => {
  useEffect(() => {
    return () => {
      resultOpen.value = false;
      error.value = "";
    };
  }, []);

  return (
    <Snackbar
      open={resultOpen.value}
      autoHideDuration={6000}
      onClose={() => (resultOpen.value = false)}
      TransitionProps={{ onExited: () => (error.value = "") }}
    >
      <Alert
        onClose={() => (resultOpen.value = false)}
        severity={error.value ? "error" : "success"}
        sx={{ width: "100%" }}
      >
        {error.value || "Data successfully imported"}
      </Alert>
    </Snackbar>
  );
};
