import ListSubheader from "@mui/material/ListSubheader";
import moment from "moment";
import { calendarTime } from "../../utils/date";

type SubheaderItemProps = {
  dayStart: number;
  stickyItemVisible?: boolean;
};

export const SubheaderItem = (props: SubheaderItemProps) => {
  const { dayStart, stickyItemVisible } = props;
  return (
    <ListSubheader style={{ opacity: stickyItemVisible ? 0 : 1 }}>
      {calendarTime(moment(dayStart))}
    </ListSubheader>
  );
};
