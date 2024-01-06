import {
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from "@mui/material";
import { useLoaderData } from "react-router-dom";
import { Activity } from "../../data/activity/Storage";
import { FullScreenModalContent } from "../../components/FullScreenModalContent";
import {
  useIntervalDuration,
  useIntervalsGroupedByDay,
} from "../../data/interval/Signals";
import { IntervalWithActivity } from "../../data/interval/Algorithms";
import { useActivityPath } from "../../data/activity/Signals";
import { Fragment } from "react";

export const ActivityRoute = () => {
  const activity = useLoaderData() as Activity;
  const { name } = activity;
  return (
    <Paper square sx={{ pt: 1, minHeight: "100%" }}>
      <FullScreenModalContent headline={name.value}>
        <Intervals activity={activity} />
      </FullScreenModalContent>
    </Paper>
  );
};

type IntervalsProps = {
  activity: Activity;
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
        {Object.values(groupedIntervals.value)
          .toReversed()
          .map((intervalsWithActivity) => (
            <Fragment
              key={intervalsWithActivity[0].interval.start.value.valueOf()}
            >
              <ListSubheader>
                {intervalsWithActivity[0].interval.start.value.format(
                  "MMMM D, YYYY",
                )}
              </ListSubheader>
              {intervalsWithActivity
                .toReversed()
                .map((intervalWithActivity) => (
                  <IntervalItem
                    key={intervalWithActivity.interval.id}
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
  activity: Activity;
  intervalWithActivity: IntervalWithActivity;
};

const IntervalItem = (props: IntervalProps) => {
  const { activity, intervalWithActivity } = props;
  const { interval, activity: subActivity } = intervalWithActivity;
  const { start, end } = interval;
  const duration = useIntervalDuration(interval);

  const subActivityPath = useActivityPath(activity, subActivity);
  const subActivitySuffix =
    activity.id !== subActivity.id ? ` (${subActivityPath.value})` : "";

  const startValue = start.value.format(INTERVAL_FORMAT);
  const endValue = end.value?.format(INTERVAL_FORMAT) ?? "now";

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
    </ListItem>
  );
};

const INTERVAL_FORMAT = "HH:mm:ss";
