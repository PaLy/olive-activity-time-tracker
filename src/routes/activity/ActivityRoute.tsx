import {
  Box,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from "@mui/material";
import { Link, Outlet, useParams } from "react-router-dom";
import { Activity } from "../../data/activity/Storage";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import {
  useIntervalDuration,
  useIntervalsGroupedByDay,
} from "../../data/interval/Signals";
import { IntervalWithActivity } from "../../data/interval/Algorithms";
import { useActivityPath } from "../../data/activity/Signals";
import {
  ElementType,
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import EditIcon from "@mui/icons-material/Edit";
import { DeleteIntervalConfirmation } from "./DeleteIntervalConfirmation";
import { Interval } from "../../data/interval/Interval";
import AutoSizer from "react-virtualized-auto-sizer";
import { ResizableList, SingleItemData } from "../../components/ResizableList";
import { calendarTime } from "../../utils/Date";
import { useActivities } from "../../data/activity/Operations";
import { useOpenErrorSnackbar } from "../../components/AppSnackbar";

export const ActivityRoute = () => {
  const { activityID = "" } = useParams<{ activityID: string }>();
  const { data: activities, isLoading } = useActivities();
  const activity = activities?.get(activityID);

  useOpenErrorSnackbar(!isLoading && !activity ? "Activity not found." : null);

  return (
    <>
      <Paper square sx={{ height: "100%" }}>
        {isLoading ? (
          <Loading />
        ) : activities && activity ? (
          <Content activity={activity} activities={activities} />
        ) : (
          <></>
        )}
      </Paper>
      <Outlet />
      <DeleteIntervalConfirmation />
    </>
  );
};

type ContentProps = {
  activities: Map<string, Activity>;
  activity: Activity;
};

const Content = (props: ContentProps) => {
  const { activities, activity } = props;
  const { groupedIntervals } = useIntervalsGroupedByDay(activity, activities);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const rowData = useRowData(groupedIntervals, activity, visibleStartIndex);

  const topInterval = useMemo(() => {
    if (visibleStartIndex > 0) {
      return rowData
        .slice(visibleStartIndex)
        .find(
          (
            singleRowData,
          ): singleRowData is SingleItemData<typeof IntervalItem> =>
            singleRowData.RowComponent === IntervalItem,
        )?.rowProps.intervalWithActivity.interval;
    } else {
      return undefined;
    }
  }, [rowData, visibleStartIndex]);

  return (
    <AutoSizer>
      {({ width, height }) => (
        <ResizableList
          height={height}
          width={width}
          itemData={rowData}
          innerElementType={innerElementType}
          innerRef={(ref: InnerRefValue | null) =>
            ref?.setTopInterval(topInterval)
          }
          onItemsRendered={(props) => {
            setVisibleStartIndex(props.visibleStartIndex);
          }}
        />
      )}
    </AutoSizer>
  );
};

function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

type InnerRefValue = {
  setTopInterval: (topInterval: Interval | undefined) => void;
};

const innerElementType = forwardRef<
  InnerRefValue,
  {
    children: ReactNode;
    style: { [key: string]: unknown };
  }
>(({ children, ...rest }, ref) => {
  const topIntervalRef = useRef<Interval | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    setTopInterval: (topInterval) => {
      topIntervalRef.current = topInterval;
    },
  }));

  return (
    <Box {...rest} sx={{ mb: 1 }}>
      <StickySubheader interval={topIntervalRef.current} />
      {children}
    </Box>
  );
});

type StickySubheaderProps = {
  interval: Interval | undefined;
};

const StickySubheader = (props: StickySubheaderProps) => {
  const { interval } = props;
  return <>{interval && <SubheaderItem interval={interval} />}</>;
};

type TopOfIntervalListProps = {
  activity: Activity;
};

const TopOfIntervalList = (props: TopOfIntervalListProps) => {
  const { activity } = props;
  const path = useActivityPath(activity);
  return (
    <Box sx={{ pt: 1, pb: 1 }}>
      <FullScreenModalHeader headline={path} />
      <Typography variant="h6" sx={{ pl: 2, pr: 2 }}>
        Intervals
      </Typography>
    </Box>
  );
};

const useRowData = (
  groupedIntervals: { [key: string]: IntervalWithActivity[] } = {},
  activity: Activity,
  visibleStartIndex: number,
) => {
  return useMemo(() => {
    let index = 1;
    return [
      {
        RowComponent: TopOfIntervalList,
        rowProps: { activity },
        rowData: { size: 96 },
      },
      ...Object.values(groupedIntervals).flatMap((intervals) => {
        const finalIndex = index;
        const subheaderData: SingleItemData<typeof SubheaderItem> = {
          RowComponent: SubheaderItem,
          rowProps: {
            interval: intervals[0].interval,
            stickyItemVisible: visibleStartIndex === finalIndex,
          },
          rowData: { size: 48 },
        };
        const intervalsRowData: SingleItemData<typeof IntervalItem>[] =
          intervals.map((intervalWithActivity) => ({
            RowComponent: IntervalItem,
            rowProps: { activity, intervalWithActivity },
            rowData: { size: 60 },
          }));
        const items = [subheaderData, ...intervalsRowData];
        index += items.length;
        return items;
      }),
    ] as SingleItemData<ElementType>[];
  }, [activity, groupedIntervals, visibleStartIndex]);
};

type SubheaderItemProps = {
  interval: Interval;
  stickyItemVisible?: boolean;
};

const SubheaderItem = (props: SubheaderItemProps) => {
  const { interval, stickyItemVisible } = props;
  if (stickyItemVisible) {
    return null;
  } else {
    return <ListSubheader>{calendarTime(interval.start)}</ListSubheader>;
  }
};

type IntervalProps = {
  activity: Activity;
  intervalWithActivity: IntervalWithActivity;
};

const IntervalItem = (props: IntervalProps) => {
  const { activity, intervalWithActivity } = props;
  const { interval, activity: subActivity } = intervalWithActivity;
  const { start } = interval;
  const duration = useIntervalDuration(interval, false);

  const subActivityPath = useActivityPath(subActivity, activity);
  const subActivitySuffix =
    activity.id !== subActivity.id ? ` (${subActivityPath})` : "";

  const startValue = start.format(INTERVAL_FORMAT);
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

const INTERVAL_FORMAT = "HH:mm:ss";

const formatIntervalEnd = (interval: Interval) => {
  const { start, end } = interval;
  if (!end) {
    return "now";
  } else if (start.isSame(end, "day")) {
    return end.format(INTERVAL_FORMAT);
  } else {
    return end.format("ddd, MMM D, YYYY HH:mm");
  }
};
