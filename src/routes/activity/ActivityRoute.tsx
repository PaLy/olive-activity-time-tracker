import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from "@mui/material";
import { Link, Outlet, useLoaderData } from "react-router-dom";
import { Activity } from "../../data/activity/Storage";
import { FullScreenModalContent } from "../../components/FullScreenModalContent";
import {
  useIntervalDuration,
  useIntervalsGroupedByDay,
} from "../../data/interval/Signals";
import { IntervalWithActivity } from "../../data/interval/Algorithms";
import { useActivityPath } from "../../data/activity/Signals";
import { Fragment } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { SuccessSnackbar } from "./SuccessSnackbar";
import { DeleteIntervalConfirmation } from "./DeleteIntervalConfirmation";
import { Interval } from "../../data/interval/Interval";
import { Signal } from "@preact/signals-react";

export const ActivityRoute = () => {
  const activity = useLoaderData() as Signal<Activity>;
  const path = useActivityPath(activity);
  return (
    <>
      <Paper square sx={{ pt: 1, minHeight: "100%" }}>
        <FullScreenModalContent headline={path.value}>
          <Intervals activity={activity} />
        </FullScreenModalContent>
      </Paper>
      <Outlet />
      <DeleteIntervalConfirmation />
      <SuccessSnackbar />
    </>
  );
};

type IntervalsProps = {
  activity: Signal<Activity>;
};

const Intervals = (props: IntervalsProps) => {
  const { activity } = props;
  const groupedIntervals = useIntervalsGroupedByDay(activity);
  return (
    <>
      <Typography variant="h6" sx={{ ml: 2, mr: 2 }}>
        Intervals
      </Typography>
      <List>
        {Object.values(groupedIntervals.value).map((intervalsWithActivity) => (
          <Fragment
            key={intervalsWithActivity[0].interval.value.start.value.valueOf()}
          >
            <ListSubheader>
              {intervalsWithActivity[0].interval.value.start.value.format(
                "ddd, MMM D, YYYY",
              )}
            </ListSubheader>
            {intervalsWithActivity.map((intervalWithActivity) => (
              <IntervalItem
                key={intervalWithActivity.interval.value.id}
                activity={activity}
                intervalWithActivity={intervalWithActivity}
              />
            ))}
          </Fragment>
        ))}
      </List>
    </>
  );
};

type IntervalProps = {
  activity: Signal<Activity>;
  intervalWithActivity: IntervalWithActivity;
};

const IntervalItem = (props: IntervalProps) => {
  const { activity, intervalWithActivity } = props;
  const { interval, activity: subActivity } = intervalWithActivity;
  const { start } = interval.value;
  const duration = useIntervalDuration(interval);

  const subActivityPath = useActivityPath(subActivity, activity);
  const subActivitySuffix =
    activity.value.id !== subActivity.value.id
      ? ` (${subActivityPath.value})`
      : "";

  const startValue = start.value.format(INTERVAL_FORMAT);
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
          to={`interval/${interval.value.id}`}
        >
          <EditIcon />
        </IconButton>
      </ListItemIcon>
    </ListItem>
  );
};

const INTERVAL_FORMAT = "HH:mm:ss";

const formatIntervalEnd = (interval: Signal<Interval>) => {
  const { start, end } = interval.value;
  if (!end.value) {
    return "now";
  } else if (start.value.isSame(end.value, "day")) {
    return end.value.format(INTERVAL_FORMAT);
  } else {
    return end.value.format("ddd, MMM D, YYYY HH:mm");
  }
};
