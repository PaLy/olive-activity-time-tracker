// eslint-disable-next-line no-restricted-imports
import { useLocation as useRRDLocation } from "react-router-dom";

export const useLocation = () => {
  const { pathname, ...other } = useRRDLocation();
  return {
    pathname: pathname === "/" ? "/today" : pathname,
    ...other,
  };
};
