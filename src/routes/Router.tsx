import {
  NavigateFunction,
  NavigateOptions,
  To,
  // eslint-disable-next-line no-restricted-imports
  useLocation as useRRDLocation,
  // eslint-disable-next-line no-restricted-imports
  useNavigate as useRRDNavigate,
} from "react-router-dom";

export const useLocation = () => {
  const { pathname, ...other } = useRRDLocation();
  return {
    pathname: pathname === "/" ? "/today" : pathname,
    ...other,
  };
};

/**
 * Source: https://github.com/remix-run/react-router/discussions/9922#discussioncomment-8416783
 */
export const useNavigate = (): NavigateFunction => {
  const location = useLocation();
  const navigate = useRRDNavigate();
  return (to: To | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      const previousPageExists = location.key !== "default";
      if (to === -1 && !previousPageExists) {
        navigate("/");
      } else {
        navigate(to);
      }
    } else {
      navigate(to, options);
    }
  };
};
