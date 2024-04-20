import { useInitials } from "../../utils/Strings";
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Signal, useComputed } from "@preact/signals-react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { duration } from "moment";
import { useHumanizedDuration } from "../../data/interval/Signals";
import { Activity } from "../../data/activity/Storage";
import {
  useChildrenCount,
  useDepth,
  useDuration,
  useDurationPercentage,
  useInProgress,
} from "../../data/activity/Signals";
import { ClosedInterval } from "../../data/interval/ClosedInterval";
import { Flipped } from "react-flip-toolkit";
import { Link } from "react-router-dom";
import { useExpanded, useSetExpanded } from "./state/Expanded";
import { useActivityListSettings } from "../../asyncState/ActivityList";
import { ShowCost } from "../../data/settings/Settings";
import anime from "animejs";
import {
  useStartActivity,
  useStopActivity,
} from "../../data/activity/Operations";

type ActivityItemProps = {
  activity: Activity;
  interval: Signal<ClosedInterval>;
};

export const ActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const childrenCount = useChildrenCount(activity, interval);
  const Component = childrenCount === 0 ? LeafActivityItem : ParentActivityItem;

  return (
    <Flipped flipId={activity.id} onAppear={onActivityAppear}>
      <div>
        <Component {...props} />
      </div>
    </Flipped>
  );
};

const onActivityAppear = (el: HTMLElement, i: number) => {
  anime({
    targets: el,
    opacity: 1,
    delay: i * 10,
    easing: "easeOutSine",
  });
};

const ParentActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const { name } = activity;
  const activityPL = useActivityPL(activity);
  const expanded = useExpanded(activity);
  const setExpanded = useSetExpanded();
  const childrenCount = useChildrenCount(activity, interval);

  const Expander = expanded ? ExpandLess : ExpandMore;

  return (
    <ListItemButton
      sx={{ pl: activityPL, pr: 0 }}
      onClick={() => setExpanded({ activity, expanded: !expanded })}
    >
      <ActivityAvatar activity={activity} />
      <ListItemText
        primary={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Expander viewBox={"5 0 13 24"} sx={{ width: "initial", mr: 1 }} />
            <span>
              {name +
                (expanded || childrenCount === 0 ? "" : ` (${childrenCount})`)}
            </span>
          </div>
        }
        secondary={<ActivityRow2 activity={activity} interval={interval} />}
      />
      <ListItemIcon>
        <StartStopButton activity={activity} />
      </ListItemIcon>
    </ListItemButton>
  );
};

const LeafActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const { name } = activity;
  const activityPL = useActivityPL(activity);

  return (
    <ListItem sx={{ pl: activityPL, pr: 0 }}>
      <ActivityAvatar activity={activity} />
      <ListItemText
        primary={name}
        secondary={<ActivityRow2 activity={activity} interval={interval} />}
      />
      <ListItemIcon>
        <StartStopButton activity={activity} />
      </ListItemIcon>
    </ListItem>
  );
};

const useActivityPL = (activity: Activity) => 2 + 2 * useDepth(activity);

type ActivityAvatarProps = {
  activity: Activity;
};

const ActivityAvatar = (props: ActivityAvatarProps) => {
  const { id } = props.activity;
  const name = useComputed(() => props.activity.name);
  const initials = useInitials(name);
  return (
    <ListItemAvatar>
      <Avatar
        component={Link}
        to={`/activities/${id}`}
        sx={{ textDecoration: "none" }}
        onClick={(event) => event.stopPropagation()}
      >
        {initials}
      </Avatar>
    </ListItemAvatar>
  );
};

type StartStopActivityProps = {
  activity: Activity;
};

const StartStopButton = (props: StartStopActivityProps) => {
  const { activity } = props;
  const inProgress = useInProgress(activity);
  const ariaLabel = inProgress ? "stop activity" : "start activity";

  const { mutate: startActivity, isPending: starting } = useStartActivity();
  const { mutate: stopActivity, isPending: stopping } = useStopActivity();

  return (
    <IconButton
      aria-label={ariaLabel}
      disabled={starting || stopping}
      onClick={async (event) => {
        // stops ListItemButton click
        event.stopPropagation();
        if (inProgress) {
          startActivity({ activity });
        } else {
          stopActivity({ activity });
        }
      }}
      // stops ListItemButton click effect
      onMouseDown={(event) => event.stopPropagation()}
    >
      {inProgress ? <StopIcon color={"warning"} /> : <PlayArrowIcon />}
    </IconButton>
  );
};

type ActivityRow2Props = {
  activity: Activity;
  interval: Signal<ClosedInterval>;
};

const ActivityRow2 = (props: ActivityRow2Props) => {
  const { activity, interval } = props;
  const durationPercentage = useDurationPercentage(activity, interval);
  const duration = useDuration(activity, interval);
  const inProgress = useInProgress(activity);
  const humanizedDuration = useHumanizedDuration(duration, inProgress);
  const { showDuration, showCost, showPercentage } = useActivityListSettings();
  const cost = getCost(duration, showCost);

  return (
    <>
      {showPercentage && <>{durationPercentage} %</>}
      {showCost.show && <> • {cost}</>}
      {showDuration && (
        <>
          <br /> {humanizedDuration}
        </>
      )}
    </>
  );
};

const getCost = (durationMs: number, showCost: ShowCost) => {
  const { perHour, currency } = showCost;
  const cost =
    Math.round(duration(durationMs).asHours() * Number(perHour) * 100) / 100;

  return Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
  }).format(cost);
};
