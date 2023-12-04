import { Signal, signal, useComputed, useSignal } from "@preact/signals-react";
import { Activity } from "../data/Model";
import { useInitials } from "../utils/Strings";
import {
  Interval,
  rootActivity,
  startActivity,
  stopActivity,
  useChildActivities,
  useDepth,
  useDuration,
  useDurationPercentage,
  useInProgress,
} from "../data/Activity";
import {
  Avatar,
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
} from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import humanizeDuration from "humanize-duration";
import { duration } from "moment/moment";

type ActivityListProps = {
  interval: Signal<Interval>;
  subHeader: string;
};

export const ActivityList = (props: ActivityListProps) => {
  const { interval, subHeader } = props;
  const childActivities = useChildActivities(rootActivity, interval);
  return (
    <Paper square sx={{ pb: "50px" }}>
      <List sx={{ mb: 2, pt: 0 }}>
        <ListSubheader sx={{ bgcolor: "background.paper", top: "64px" }}>
          {subHeader}
        </ListSubheader>
        {childActivities.value.map((activity) => (
          <ActivityItem
            key={activity.value.id}
            activity={activity}
            interval={interval}
          />
        ))}
      </List>
    </Paper>
  );
};

type ActivityItemProps = {
  activity: Signal<Activity>;
  interval: Signal<Interval>;
};

const ActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const childActivities = useChildActivities(activity, interval);
  const Item = useComputed(() =>
    childActivities.value.length > 0 ? ParentActivityItem : LeafActivityItem,
  ).value;
  return <Item {...props} />;
};

const ParentActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const { name } = activity.value;
  const initials = useInitials(name);
  const depth = useDepth(activity);
  const open = useSignal(true);
  const childActivities = useChildActivities(activity, interval);

  return (
    <>
      <ListItemButton
        sx={{ pl: 2 + 3 * depth.value }}
        onClick={() => (open.value = !open.value)}
      >
        <ListItemAvatar>
          <Avatar>{initials}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            name.value +
            (open.value || childActivities.value.length === 0
              ? ""
              : ` (${childActivities.value.length})`)
          }
          secondary={<ActivityRow2 activity={activity} interval={interval} />}
        />
        <ListItemIcon>
          <StartStopButton activity={activity} />
        </ListItemIcon>
        {open.value ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open.value} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {childActivities.value.map((activity) => (
            <ActivityItem
              key={activity.value.id}
              activity={activity}
              interval={interval}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

const LeafActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const { name } = activity.value;
  const initials = useInitials(name);
  const depth = useDepth(activity);

  return (
    <>
      <ListItem sx={{ pl: 2 + 3 * depth.value }}>
        <ListItemAvatar>
          <Avatar>{initials}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={name}
          secondary={<ActivityRow2 activity={activity} interval={interval} />}
        />
        {/* align with the parent button */}
        <ListItemIcon sx={{ mr: 3 }}>
          <StartStopButton activity={activity} />
        </ListItemIcon>
      </ListItem>
    </>
  );
};

type StartStopActivityProps = {
  activity: Signal<Activity>;
};

const StartStopButton = (props: StartStopActivityProps) => {
  const { activity } = props;
  const inProgress = useInProgress(activity);
  const ariaLabel = inProgress.value ? "stop activity" : "start activity";

  return (
    <IconButton
      aria-label={ariaLabel}
      onClick={(event) => {
        // stops ListItemButton click
        event.stopPropagation();
        inProgress.value ? stopActivity(activity) : startActivity(activity);
      }}
      // stops ListItemButton click effect
      onMouseDown={(event) => event.stopPropagation()}
    >
      {inProgress.value ? <StopIcon color={"warning"} /> : <PlayArrowIcon />}
    </IconButton>
  );
};

type ActivityRow2Props = {
  activity: Signal<Activity>;
  interval: Signal<Interval>;
};

const ActivityRow2 = (props: ActivityRow2Props) => {
  const { activity, interval } = props;
  const durationPercentage = useDurationPercentage(activity, interval);
  const duration = useDuration(activity, interval);
  const humanizedDuration = useHumanizedDuration(duration, activity);
  const wage = useWage(duration);
  return (
    <>
      {durationPercentage} %
      <Box sx={{ ml: 1 }} component={"span"}>
        |
      </Box>
      <Box sx={{ ml: 1 }} component={"span"}>
        {wage} €
      </Box>
      <Box sx={{ ml: 1 }} component={"span"}>
        |
      </Box>
      <Box sx={{ ml: 1 }} component={"span"}>
        {humanizedDuration}
      </Box>
    </>
  );
};

const useHumanizedDuration = (
  duration: Signal<number>,
  activity: Signal<Activity>,
) => {
  const inProgress = useInProgress(activity);
  return useComputed(() => humanize(duration, inProgress));
};

const humanize = (duration: Signal<number>, inProgress: Signal<boolean>) =>
  humanizeDuration(duration.value, {
    delimiter: " ",
    largest: inProgress.value ? Infinity : 2,
    round: true,
    units: inProgress.value
      ? ["y", "mo", "w", "d", "h", "m", "s"]
      : ["y", "mo", "w", "d", "h", "m"],
  });

const hourlyEuroWage = signal(10);

const useWage = (durationMs: Signal<number>) =>
  useComputed(
    () =>
      Math.round(
        duration(durationMs.value).asHours() * hourlyEuroWage.value * 100,
      ) / 100,
  );
