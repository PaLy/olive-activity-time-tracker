import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link } from "react-router";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "../../utils/dayjs";
import { Activity, Interval } from "../../db/entities";
import { useActivityFullName } from "./hooks";
import { useIntervalDuration } from "../intervals/hooks";
import { MAX_DATE_MS } from "../../utils/date";

type IntervalItemProps = {
  activityId: number;
  interval: Interval;
  activities: Map<number, Activity>;
};

const INTERVAL_FORMAT = "HH:mm:ss";

const formatIntervalEnd = (interval: Interval) => {
  const { start, end } = interval;
  if (end === MAX_DATE_MS) {
    return "now";
  } else if (dayjs(start).isSame(dayjs(end), "day")) {
    return dayjs(end).format(INTERVAL_FORMAT);
  } else {
    return dayjs(end).format("ddd, MMM D, YYYY HH:mm");
  }
};

export const IntervalItem = (props: IntervalItemProps) => {
  const { activityId, interval, activities } = props;
  const { start, activityId: subActivityId } = interval;
  const duration = useIntervalDuration(interval.start, interval.end, false);

  const subActivityPath = useActivityFullName(
    subActivityId,
    activities,
    activityId,
  );
  const subActivitySuffix =
    activityId !== subActivityId ? ` (${subActivityPath})` : "";

  const startValue = dayjs(start).format(INTERVAL_FORMAT);
  const endValue = formatIntervalEnd(interval);

  return (
    <ListItem dense={true}>
      <ListItemText
        primary={
          <>
            {startValue} — {endValue}
            {subActivitySuffix}
          </>
        }
        secondary={<>{duration}</>}
      />
      <ListItemIcon sx={{ minWidth: "initial" }}>
        <IconButton
          aria-label={"edit interval"}
          component={Link}
          to={`interval/${interval.id}`}
        >
          <EditIcon />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  );
};
