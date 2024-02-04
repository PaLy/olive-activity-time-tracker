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
import { Signal } from "@preact/signals-react";
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
import { startActivity, stopActivity } from "../../data/activity/Update";
import { ClosedInterval } from "../../data/interval/ClosedInterval";
import { Flipped } from "react-flip-toolkit";
import { Link } from "react-router-dom";
import { useExpanded, useSetExpanded } from "./state/Expanded";
import { useActivityListSettings } from "../../asyncState/ActivityList";
import { ShowCost } from "../../data/settings/Settings";

type ActivityItemProps = {
  activity: Signal<Activity>;
  interval: Signal<ClosedInterval>;
};

export const ActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const childrenCount = useChildrenCount(activity, interval);
  const Component =
    childrenCount.value === 0 ? LeafActivityItem : ParentActivityItem;
  return <Component {...props} />;
};

const ParentActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const { name, id } = activity.value;
  const activityPL = useActivityPL(activity);
  const expanded = useExpanded(activity);
  const setExpanded = useSetExpanded();
  const childrenCount = useChildrenCount(activity, interval);

  const Expander = expanded ? ExpandLess : ExpandMore;

  return (
    <>
      <Flipped flipId={id}>
        <div>
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
                  <Expander
                    viewBox={"5 0 13 24"}
                    sx={{ width: "initial", mr: 1 }}
                  />
                  <span>
                    {name.value +
                      (expanded || childrenCount.value === 0
                        ? ""
                        : ` (${childrenCount.value})`)}
                  </span>
                </div>
              }
              secondary={
                <ActivityRow2 activity={activity} interval={interval} />
              }
            />
            <ListItemIcon>
              <StartStopButton activity={activity} />
            </ListItemIcon>
          </ListItemButton>
        </div>
      </Flipped>
    </>
  );
};

const LeafActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const { name, id } = activity.value;
  const activityPL = useActivityPL(activity);

  return (
    <Flipped flipId={id}>
      <div>
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
      </div>
    </Flipped>
  );
};

const useActivityPL = (activity: Signal<Activity>) =>
  2 + 2 * useDepth(activity).value;

type ActivityAvatarProps = {
  activity: Signal<Activity>;
};

const ActivityAvatar = (props: ActivityAvatarProps) => {
  const { name, id } = props.activity.value;
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

const getCost = (durationMs: Signal<number>, showCost: ShowCost) => {
  const { perHour, currency } = showCost;
  const cost =
    Math.round(duration(durationMs.value).asHours() * Number(perHour) * 100) /
    100;

  return Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
  }).format(cost);
};
