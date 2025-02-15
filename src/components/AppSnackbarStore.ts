import { create } from "zustand";
import { AlertColor } from "@mui/material/Alert/Alert";
import { useEffect } from "react";

type AppSnackbarState = {
  open: boolean;
  message: string;
  severity?: AlertColor;
  reset: () => void;
  close: () => void;
  openError: (error: Error | string) => void;
  openSuccess: (message: string) => void;
};

export const useAppSnackbarStore = create<AppSnackbarState>((set) => ({
  open: false,
  message: "",
  reset: () => set({ open: false, message: "" }),
  close: () => set({ open: false }),
  openError: (error) => {
    const message = typeof error === "string" ? error : error.message;
    set({ open: true, message, severity: "error" });
  },
  openSuccess: (message) => {
    set({ open: true, message, severity: "success" });
  },
}));

export const useOpenErrorSnackbar = (error: Error | string | null) => {
  const openErrorSnackbar = useAppSnackbarStore((state) => state.openError);
  useEffect(() => {
    if (error) {
      openErrorSnackbar(error);
    }
  }, [error]);
};
