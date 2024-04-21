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
import { Link, Outlet, useLoaderData } from "react-router-dom";
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
} from "react";
import EditIcon from "@mui/icons-material/Edit";
import { DeleteIntervalConfirmation } from "./DeleteIntervalConfirmation";
import { Interval } from "../../data/interval/Interval";
import { computed, signal, Signal, useSignal } from "@preact/signals-react";
import AutoSizer from "react-virtualized-auto-sizer";
import moment from "moment";
import { ResizableList, SingleItemData } from "../../components/ResizableList";

export const ActivityRoute = () => {
  const activity = useLoaderData() as Activity;
  const { groupedIntervals, isLoading } = useIntervalsGroupedByDay(activity);
  const visibleStartIndex = useSignal(0);
  const rowData = useRowData(groupedIntervals, activity, visibleStartIndex);

  const topInterval = useMemo(() => {
    if (visibleStartIndex.value > 0) {
      return rowData
        .slice(visibleStartIndex.value)
        .find(
          (
            singleRowData,
          ): singleRowData is SingleItemData<typeof IntervalItem> =>
            singleRowData.RowComponent === IntervalItem,
        )?.rowProps.intervalWithActivity.interval;
    } else {
      return undefined;
    }
  }, [rowData, visibleStartIndex.value]);

  return (
    <>
      <Paper square sx={{ height: "100%" }}>
        {isLoading ? (
          <Loading />
        ) : (
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
                onItemsRendered={(props) =>
                  (visibleStartIndex.value = props.visibleStartIndex)
                }
              />
            )}
          </AutoSizer>
        )}
      </Paper>
      <Outlet />
      <DeleteIntervalConfirmation />
    </>
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
  return (
    <>
      {interval && (
        <SubheaderItem
          interval={interval ?? { id: "", start: moment(), end: moment() }}
        />
      )}
    </>
  );
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
  visibleStartIndex: Signal<number>,
) => {
  return useMemo(() => {
    let index = 1;
    return [
      {
        RowComponent: TopOfIntervalList,
        rowProps: { activity },
        rowData: { size: signal(96) },
      },
      ...Object.values(groupedIntervals).flatMap((intervals) => {
        const finalIndex = index;
        const subheaderData: SingleItemData<typeof SubheaderItem> = {
          RowComponent: SubheaderItem,
          rowProps: {
            interval: intervals[0].interval,
            stickyItemVisible: computed(
              () => visibleStartIndex.value === finalIndex,
            ),
          },
          rowData: { size: signal(48) },
        };
        const intervalsRowData: SingleItemData<typeof IntervalItem>[] =
          intervals.map((intervalWithActivity) => ({
            RowComponent: IntervalItem,
            rowProps: { activity, intervalWithActivity },
            rowData: { size: signal(60) },
          }));
        const items = [subheaderData, ...intervalsRowData];
        index += items.length;
        return items;
      }),
    ] as SingleItemData<ElementType>[];
  }, [activity, groupedIntervals, visibleStartIndex.value]);
};

type SubheaderItemProps = {
  interval: Interval;
  stickyItemVisible?: Signal<boolean>;
};

const SubheaderItem = (props: SubheaderItemProps) => {
  const { interval, stickyItemVisible } = props;
  if (stickyItemVisible?.value) {
    return null;
  } else {
    return (
      <ListSubheader>{interval.start.format("ddd, MMM D, YYYY")}</ListSubheader>
    );
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
