import { ReactNode, Ref, useImperativeHandle, useRef } from "react";
import Box from "@mui/material/Box";
import { Interval } from "../../db/entities";
import { StickySubheader } from "./StickySubheader";

export type InnerElementTypeRef = {
  setTopInterval: (topInterval: Interval | undefined) => void;
};

type InnerElementTypeProps = {
  children: ReactNode;
  style: { [key: string]: unknown };
  ref: Ref<InnerElementTypeRef>;
};

export const InnerElementType = (props: InnerElementTypeProps) => {
  const { children, ref, ...rest } = props;
  const topIntervalRef = useRef<Interval | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    setTopInterval: (topInterval) => {
      topIntervalRef.current = topInterval;
    },
  }));

  return (
    <Box {...rest} sx={{ mb: 1 }}>
      <StickySubheader interval={topIntervalRef.current} />
      {children}
    </Box>
  );
};
