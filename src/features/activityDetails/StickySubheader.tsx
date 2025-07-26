import { SubheaderItem } from "./SubheaderItem";
import { Interval } from "../../db/entities";

type StickySubheaderProps = {
  interval: Interval | undefined;
};

export const StickySubheader = (props: StickySubheaderProps) => {
  const { interval } = props;
  return <>{interval && <SubheaderItem dayStart={interval.start} />}</>;
};
