import { getInitials } from "../../utils/strings";
import { getIdColor } from "../../utils/color";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import dayjs from "dayjs";
import { Flipped } from "react-flip-toolkit";
import { Link } from "react-router";
import { animate } from "animejs";
import { useMemo } from "react";
import { getLocale } from "../../utils/locale";
import { setExpanded } from "../../db/queries/activities";
import { ActivityTreeNode } from "../../db/queries/activitiesTree";
import {
  depth,
  useIsInProgressInInterval,
  useDuration,
  useDurationPercentage,
  useStartActivity,
  useStopActivity,
} from "../activities/services";
import {
  ACTIVITY_FULL_NAME_SEPARATOR,
  ACTIVITY_LIST_MAX_DEPTH,
} from "../activities/constants";
import { SimpleInterval } from "../../utils/types";
import { useHumanizedDuration } from "../../utils/duration";
import { useActivityListSettings } from "../settings/services";
import { ShowCost } from "../../db/entities";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";

type ActivityItemProps = {
  activity: ActivityTreeNode;
  interval: SimpleInterval;
};

export const ActivityItem = (props: ActivityItemProps) => {
  const { activity } = props;
  const childrenCount = activity.children.length;
  const Component = childrenCount === 0 ? LeafActivityItem : ParentActivityItem;

  return (
    <Flipped flipId={activity.id} onAppear={onActivityAppear}>
      <div data-testid={`activity-item-${activity.id}`}>
        <Component {...props} />
      </div>
    </Flipped>
  );
};

const onActivityAppear = (el: HTMLElement, i: number) => {
  animate(el, {
    opacity: 1,
    delay: i * 10,
    ease: "outSine",
  });
};

const ParentActivityItem = (props: ActivityItemProps) => {
  const { activity, interval } = props;
  const name = getDisplayName(activity);
  const activityPL = getActivityPL(activity);
  const expanded = activity.expanded;
  const childrenCount = activity.children.length;

  const Expander = expanded ? ExpandLess : ExpandMore;

  return (
    <ListItemButton
      sx={{ pl: activityPL, pr: 2 }}
      onClick={() =>
        setExpanded(activity.id, !expanded).catch((e) => {
          console.error(e);
          useAppSnackbarStore
            .getState()
            .openError("Failed to expand/collapse activity");
        })
      }
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
  const name = getDisplayName(activity);
  const activityPL = getActivityPL(activity);

  return (
    <ListItem sx={{ pl: activityPL, pr: 2 }}>
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

const getActivityPL = (activity: ActivityTreeNode) =>
  2 + 2 * Math.min(depth(activity), ACTIVITY_LIST_MAX_DEPTH);

// Beyond the max depth, descendants are not indented further, so the path
// below the max-depth level is prepended to the name instead.
const getDisplayName = (activity: ActivityTreeNode) => {
  const activityDepth = depth(activity);
  if (activityDepth <= ACTIVITY_LIST_MAX_DEPTH) {
    return activity.name;
  }
  const subpath: string[] = [];
  let ancestor = activity.parent;
  for (
    let d = activityDepth - 1;
    d >= ACTIVITY_LIST_MAX_DEPTH && ancestor;
    d--
  ) {
    subpath.unshift(ancestor.name);
    ancestor = ancestor.parent;
  }
  return [...subpath, activity.name].join(ACTIVITY_FULL_NAME_SEPARATOR);
};

type ActivityAvatarProps = {
  activity: ActivityTreeNode;
};

const ActivityAvatar = (props: ActivityAvatarProps) => {
  const { id, name } = props.activity;
  const initials = useMemo(() => getInitials(name), [name]);
  const color = getIdColor(id);
  return (
    <ListItemAvatar>
      <Avatar
        component={Link}
        to={`/activities/${id}`}
        viewTransition
        sx={{ textDecoration: "none", bgcolor: color, color: "#fff" }}
        onClick={(event) => event.stopPropagation()}
      >
        {initials}
      </Avatar>
    </ListItemAvatar>
  );
};

type StartStopActivityProps = {
  activity: ActivityTreeNode;
};

const StartStopButton = (props: StartStopActivityProps) => {
  const { activity } = props;
  const inProgress = activity.inProgress;
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
          stopActivity({ activity }).then();
        } else {
          startActivity({ activity }).then();
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
  activity: ActivityTreeNode;
  interval: SimpleInterval;
};

const ActivityRow2 = (props: ActivityRow2Props) => {
  const { activity, interval } = props;
  const durationPercentage = useDurationPercentage(activity, interval);
  const duration = useDuration(activity, interval);
  const inProgress = useIsInProgressInInterval(activity, interval);
  const humanizedDuration = useHumanizedDuration(duration, inProgress);
  const { showDuration, showCost, showPercentage } = useActivityListSettings();
  const cost = getCost(duration, showCost);

  const somethingShownBeforeDuration = showPercentage || showCost.show;

  return (
    <span data-testid={"activity-duration"}>
      {showPercentage && <>{durationPercentage} %</>}
      {showCost.show && (
        <>
          {showPercentage && " • "}
          {cost}
        </>
      )}
      {showDuration && (
        <>
          {somethingShownBeforeDuration && <br />}
          {humanizedDuration}
        </>
      )}
    </span>
  );
};

const getCost = (durationMs: number, showCost: ShowCost) => {
  const { perHour, currency } = showCost;
  const cost =
    Math.round(dayjs.duration(durationMs).asHours() * Number(perHour) * 100) /
    100;

  return Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency: currency,
  }).format(cost);
};
