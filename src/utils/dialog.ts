import { useEffect, useState } from "react";

export const useDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      // Check if the dialog is currently open
      if (open) {
        setOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [open]);

  const onOpen = () => {
    // Add a new state to the browser history
    window.history.pushState({ dialogOpen: true }, "", null);
    setOpen(true);
  };

  const onClose = () => {
    // Navigate back to remove the history entry
    if (window.history.state?.dialogOpen) {
      window.history.back();
    }
    setOpen(false);
  };

  return { open, onOpen, onClose };
};
