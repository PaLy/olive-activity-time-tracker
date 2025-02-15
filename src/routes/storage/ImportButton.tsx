import { Alert, Button, Snackbar } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ChangeEvent, useEffect } from "react";
import { importDB } from "../../data/Storage";
import { useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";

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
  const reset = useImportStore((state) => state.reset);
  const openResult = useImportStore((state) => state.openResult);
  const setError = useImportStore((state) => state.setError);

  return async (event: ChangeEvent<HTMLInputElement>) => {
    reset();
    const file = event.target.files?.[0];
    if (file) {
      const fileText = await file.text();
      try {
        const { valid, errors } = await importDB(fileText);
        if (!valid) {
          setError("Invalid JSON");
          console.error("Invalid JSON:", errors);
        }
        await queryClient.invalidateQueries();
      } catch (e) {
        console.error(e);
        // TODO delete data?
        setError("Failed to import data.");
      }
    } else {
      setError("Invalid file.");
    }
    openResult();
    event.target.value = "";
  };
};

type ImportState = {
  resultOpen: boolean;
  error: string;
  reset: () => void;
  clearError: () => void;
  openResult: () => void;
  closeResult: () => void;
  setError: (error: string) => void;
};

const useImportStore = create<ImportState>((set) => ({
  resultOpen: false,
  error: "",
  reset: () => set({ resultOpen: false, error: "" }),
  clearError: () => set({ error: "" }),
  openResult: () => set({ resultOpen: true }),
  closeResult: () => set({ resultOpen: false }),
  setError: (error) => set({ error }),
}));

const Result = () => {
  const reset = useImportStore((state) => state.reset);
  const resultOpen = useImportStore((state) => state.resultOpen);
  const error = useImportStore((state) => state.error);
  const closeResult = useImportStore((state) => state.closeResult);
  const clearError = useImportStore((state) => state.clearError);

  useEffect(() => {
    return reset;
  }, []);

  return (
    <Snackbar
      open={resultOpen}
      autoHideDuration={6000}
      onClose={closeResult}
      TransitionProps={{ onExited: clearError }}
    >
      <Alert
        onClose={closeResult}
        severity={error ? "error" : "success"}
        sx={{ width: "100%" }}
      >
        {error || "Data successfully imported."}
      </Alert>
    </Snackbar>
  );
};
