import {
  Box,
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
import { ElementType, forwardRef, ReactNode, useImperativeHandle } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { SuccessSnackbar } from "./SuccessSnackbar";
import { DeleteIntervalConfirmation } from "./DeleteIntervalConfirmation";
import { Interval } from "../../data/interval/Interval";
import {
  computed,
  ReadonlySignal,
  signal,
  Signal,
  useComputed,
  useSignal,
} from "@preact/signals-react";
import AutoSizer from "react-virtualized-auto-sizer";
import moment from "moment";
import { ResizableList, SingleItemData } from "../../components/ResizableList";

export const ActivityRoute = () => {
  const activity = useLoaderData() as Signal<Activity>;
  const groupedIntervals = useIntervalsGroupedByDay(activity);
  const visibleStartIndex = useSignal(0);
  const rowData = useRowData(groupedIntervals, activity, visibleStartIndex);

  const topInterval = useComputed(() => {
    if (visibleStartIndex.value > 0) {
      return rowData.value
        .slice(visibleStartIndex.value)
        .find(
          (
            singleRowData,
          ): singleRowData is SingleItemData<typeof IntervalItem> =>
            singleRowData.RowComponent === IntervalItem,
        )?.rowProps.intervalWithActivity.interval.value;
    } else {
      return undefined;
    }
  });

  return (
    <>
      <Paper square sx={{ height: "100%" }}>
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
      </Paper>
      <Outlet />
      <DeleteIntervalConfirmation />
      <SuccessSnackbar />
    </>
  );
};

type InnerRefValue = {
  setTopInterval: (topInterval: ReadonlySignal<Interval | undefined>) => void;
};

const innerElementType = forwardRef<
  InnerRefValue,
  {
    children: ReactNode;
    style: { [key: string]: unknown };
  }
>(({ children, ...rest }, ref) => {
  const topIntervalHolder = useSignal<Signal<Interval | undefined>>(
    signal(undefined),
  );
  const topInterval = useComputed(() => topIntervalHolder.value.value);

  useImperativeHandle(ref, () => ({
    setTopInterval: (topInterval) => {
      topIntervalHolder.value = topInterval;
    },
  }));

  return (
    <Box {...rest} sx={{ mb: 1 }}>
      <StickySubheader interval={topInterval} />
      {children}
    </Box>
  );
});

type StickySubheaderProps = {
  interval: Signal<Interval | undefined>;
};

const StickySubheader = (props: StickySubheaderProps) => {
  const { interval } = props;
  const definedInterval = useComputed(
    () =>
      interval.value ?? {
        id: "",
        start: signal(moment()),
        end: signal(moment()),
      },
  );

  return <>{interval.value && <SubheaderItem interval={definedInterval} />}</>;
};

type TopOfIntervalListProps = {
  activity: Signal<Activity>;
};

const TopOfIntervalList = (props: TopOfIntervalListProps) => {
  const { activity } = props;
  const path = useActivityPath(activity);
  return (
    <Box sx={{ pt: 1, pb: 1 }}>
      <FullScreenModalHeader headline={path.value} />
      <Typography variant="h6" sx={{ pl: 2, pr: 2 }}>
        Intervals
      </Typography>
    </Box>
  );
};

const useRowData = (
  groupedIntervals: ReadonlySignal<{ [key: string]: IntervalWithActivity[] }>,
  activity: Signal<Activity>,
  visibleStartIndex: Signal<number>,
) =>
  useComputed(() => {
    let index = 1;
    return [
      {
        RowComponent: TopOfIntervalList,
        rowProps: { activity },
        rowData: { size: signal(96) },
      },
      ...Object.values(groupedIntervals.value).flatMap((intervals) => {
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
  });

type SubheaderItemProps = {
  interval: Signal<Interval>;
  stickyItemVisible?: Signal<boolean>;
};

const SubheaderItem = (props: SubheaderItemProps) => {
  const { interval, stickyItemVisible } = props;
  if (stickyItemVisible?.value) {
    return null;
  } else {
    return (
      <ListSubheader>
        {interval.value.start.value.format("ddd, MMM D, YYYY")}
      </ListSubheader>
    );
  }
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
