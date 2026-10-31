import { useLocation, useNavigate } from "./hooks";

/**
 * Dialog open state backed by a history entry, so navigating back
 * closes only the dialog and not the underlying screen.
 */
export const useHistoryDialog = (key: string) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  return {
    isOpen: !!state?.[key],
    open: () => navigate(".", { state: { [key]: true } }),
    close: () => navigate(-1),
  };
};
