import { getInitials } from "../../utils/Strings";
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import dayjs from "dayjs";
import { Flipped } from "react-flip-toolkit";
import { Link } from "react-router";
import { animate } from "animejs";
import { useMemo } from "react";
import { getLocale } from "../../utils/Locale";
import { MAX_DATE_MS } from "../../utils/Date";
import { setExpanded } from "../../db/queries/activities";
import { ActivityTreeNode } from "../../db/queries/activitiesTree";
import {
  depth,
  isInProgress,
  useDuration,
  useDurationPercentage,
  useStartActivity,
  useStopActivity,
} from "../../features/activities/services";
import { SimpleInterval } from "../../utils/types";
import { useHumanizedDuration } from "../../utils/duration";
import { useActivityListSettings } from "../../features/settings/services";
import { ShowCost } from "../../db/entities";

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
  const { name } = activity;
  const activityPL = useActivityPL(activity);
  const expanded = activity.expanded;
  const childrenCount = activity.children.length;

  const Expander = expanded ? ExpandLess : ExpandMore;

  return (
    <ListItemButton
      sx={{ pl: activityPL, pr: 0 }}
      onClick={() => setExpanded(activity.id, !expanded)}
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

const useActivityPL = (activity: ActivityTreeNode) => 2 + 2 * depth(activity);

type ActivityAvatarProps = {
  activity: ActivityTreeNode;
};

const ActivityAvatar = (props: ActivityAvatarProps) => {
  const { id, name } = props.activity;
  const initials = useMemo(() => getInitials(name), [name]);
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
  activity: ActivityTreeNode;
};

const StartStopButton = (props: StartStopActivityProps) => {
  const { activity } = props;
  const inProgress = activity.subtreeLastEndTime === MAX_DATE_MS;
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
          stopActivity({ activity });
        } else {
          startActivity({ activity });
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
  const { activity } = props;
  const durationPercentage = useDurationPercentage(activity);
  const duration = useDuration(activity);
  const inProgress = isInProgress(activity);
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
