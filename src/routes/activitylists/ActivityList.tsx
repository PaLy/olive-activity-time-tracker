import { signal, Signal, useComputed } from "@preact/signals-react";
import { Box, Fab, Grid, Paper, useMediaQuery, useTheme } from "@mui/material";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";
import {
  rootActivity,
  useActivitiesOrderKey,
} from "../../data/activity/Signals";
import { ClosedInterval } from "../../data/interval/ClosedInterval";
import { AppAppBar } from "../../AppBar";
import { AppBottomNavigation } from "./BottomNavigation";
import { Flipper } from "react-flip-toolkit";
import { ElementType, forwardRef, ReactNode, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../Router";
import AddIcon from "@mui/icons-material/Add";
import { AddActivityModal } from "../addactivity/AddActivityModal";
import { ResizableList, SingleItemData } from "../../components/ResizableList";
import AutoSizer from "react-virtualized-auto-sizer";
import { useExpandedAllSignal } from "./state/Expanded";
import { getActivitiesByOrder, OrderBy } from "../../data/activity/Algorithms";
import { durationRefreshDisabled } from "../../data/interval/Signals";

type Props = {
  interval: Signal<ClosedInterval>;
  header: Signal<string>;
  filter: Signal<ActivityListFilter | undefined>;
  orderBy: Signal<OrderBy>;
};

export type ActivityListFilter = {
  element: ReactNode;
  // needed to avoid activities jumping
  initialHeight: number;
};

export const ActivityList = (props: Props) => {
  return (
    <Grid container direction={"column"} height={"100%"}>
      <Paper square sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AutoSizer>
          {({ width, height }) => (
            <List {...props} width={width} height={height} />
          )}
        </AutoSizer>
      </Paper>
      <AppBottomNavigation />
    </Grid>
  );
};

type ListProps = Props & { height: number; width: number };

const List = (props: ListProps) => {
  const { height, width, ...otherProps } = props;
  const { interval, orderBy } = props;
  const itemData = useItemData(otherProps);
  const innerRef = useRef<HTMLDivElement>();
  const expandedAll = useExpandedAllSignal();
  const flipKey = useActivitiesOrderKey(interval, orderBy, expandedAll);

  useEffect(() => {
    innerRef.current!.style.minHeight = `${height}px`;
  }, [height]);

  return (
    <Flipper
      flipKey={flipKey.value}
      onStart={() => (durationRefreshDisabled.value = true)}
      onComplete={() => (durationRefreshDisabled.value = false)}
    >
      <ResizableList
        itemData={itemData}
        width={width}
        height={height}
        innerElementType={innerElementType}
        innerRef={innerRef}
      />
    </Flipper>
  );
};

const innerElementType = forwardRef<
  HTMLDivElement,
  { style: { [key: string]: unknown }; children: ReactNode }
>(({ style, ...rest }, ref) => (
  <div
    ref={ref}
    style={{
      ...style,
      height: `${parseFloat(style.height as string) + 80}px`,
      flex: 1,
      display: "flex",
      flexDirection: "column",
    }}
    {...rest}
  >
    {rest.children}
    <Box
      sx={{
        position: "sticky",
        bottom: 24,
        mr: 3,
        alignSelf: "end",
        marginTop: "auto",
      }}
    >
      <AddActivityOpener />
      <AddActivityModal />
    </Box>
  </div>
));

const FILTER_PADDING_TOP = 16;

const useItemData = (props: Props) => {
  const { header, filter, interval, orderBy } = props;
  const expandedAll = useExpandedAllSignal();
  const activities = useActivities(orderBy, interval, expandedAll);

  const theme = useTheme();
  const largeAppBar = useMediaQuery(theme.breakpoints.up("sm"));

  return useComputed(
    () =>
      [
        {
          RowComponent: Header,
          rowProps: { header, filter },
          rowData: {
            size: signal(
              (filter.value
                ? filter.value.initialHeight + FILTER_PADDING_TOP
                : 0) + (largeAppBar ? 64 : 56),
            ),
          },
        } as SingleItemData<typeof Header>,
        ...activities.value.map(
          (activity) =>
            ({
              RowComponent: ActivityItem,
              rowProps: { activity, interval, key: activity.value.id },
              rowData: { size: signal(92) },
            }) as SingleItemData<typeof ActivityItem>,
        ),
      ] as SingleItemData<ElementType>[],
  );
};

const useActivities = (
  orderBy: Signal<OrderBy>,
  interval: Signal<ClosedInterval>,
  expandedAll: Signal<Set<string>>,
) =>
  useComputed(() =>
    getActivitiesByOrder(
      rootActivity,
      interval.value,
      expandedAll.value,
      orderBy,
    ),
  );

type HeaderProps = Pick<Props, "header" | "filter">;

const Header = (props: HeaderProps) => {
  const { header, filter } = props;
  return (
    <>
      <AppAppBar header={header.value} actions={<AppBarActions />} />
      {filter.value && (
        <Grid
          container
          style={{ padding: FILTER_PADDING_TOP, paddingBottom: 0 }}
          justifyContent={"center"}
        >
          {filter.value?.element}
        </Grid>
      )}
    </>
  );
};

const AddActivityOpener = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <Fab
      color="primary"
      variant={"extended"}
      aria-label="start new activity"
      onClick={() => navigate(`${pathname}/activity/add`)}
    >
      <AddIcon sx={{ mr: 1 }} />
      Add
    </Fab>
  );
};
