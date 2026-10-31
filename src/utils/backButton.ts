import { useEffect, useRef } from "react";

const BACK_BUTTON_OVERLAY_KEY = "backButtonOverlay";

/**
 * Makes the system back button (Android back gesture) close an overlay
 * (menu, popover, ...) instead of navigating away.
 *
 * While `open` is true, a history entry is pushed so back navigation pops it
 * and calls `onClose`. If the overlay is closed by other means, that entry is
 * removed again.
 */
export const useBackButtonClose = (open: boolean, onClose: () => void) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    window.history.pushState({ [BACK_BUTTON_OVERLAY_KEY]: true }, "", null);

    const handlePopState = () => {
      onCloseRef.current();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // On back navigation the entry is already gone, so this is a no-op then
      if (window.history.state?.[BACK_BUTTON_OVERLAY_KEY]) {
        window.history.back();
      }
    };
  }, [open]);
};
