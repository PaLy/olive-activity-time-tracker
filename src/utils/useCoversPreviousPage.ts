import { useLayoutEffect } from "react";

/**
 * Marks <html> while a page that replaces the previous one (rather than
 * overlaying it) is mounted, so view transitions can keep the previous page
 * visible underneath. See viewTransitions.css.
 */
export const useCoversPreviousPage = () => {
  useLayoutEffect(() => {
    document.documentElement.classList.add("covers-previous-page");
    return () =>
      document.documentElement.classList.remove("covers-previous-page");
  }, []);
};
