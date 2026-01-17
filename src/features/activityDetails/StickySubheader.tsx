import { SubheaderItem } from "./SubheaderItem";
import { Interval } from "../../db/entities";
import Box from "@mui/material/Box";

type StickySubheaderProps = {
  interval?: Interval;
};

export const StickySubheader = (props: StickySubheaderProps) => {
  const { interval } = props;
  return (
    interval && (
      <Box sx={{ position: "sticky", top: 0, height: 0 }}>
        <Box sx={{ height: 48 }}>
          <SubheaderItem dayStart={interval.start} />
        </Box>
      </Box>
    )
  );
};
