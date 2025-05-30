import { Box, Fab, Grid, Paper, useMediaQuery, useTheme } from "@mui/material";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";
import { useActivitiesOrderKey } from "../../data/activity/Hooks";
import { ClosedInterval } from "../../data/interval/ClosedInterval";
import { AppAppBar } from "../../AppBar";
import { AppBottomNavigation } from "./BottomNavigation";
import { Flipper } from "react-flip-toolkit";
import { ElementType, ReactNode, Ref, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "../Router";
import AddIcon from "@mui/icons-material/Add";
import { AddActivityModal } from "../addactivity/AddActivityModal";
import { ResizableList, SingleItemData } from "../../components/ResizableList";
import AutoSizer from "react-virtualized-auto-sizer";
import { useExpandedAll } from "./state/Expanded";
import { getActivitiesByOrder, OrderBy } from "../../data/activity/Algorithms";
import { useActivities } from "../../data/activity/Operations";
import { Activity } from "../../data/activity/Storage";
import { useClockStore } from "../../data/interval/Hooks";

type Props = {
  interval: ClosedInterval;
  header: string;
  filter?: ActivityListFilter;
  orderBy: OrderBy;
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
  const innerRef = useRef<HTMLDivElement>(null);
  const expandedAll = useExpandedAll();
  const flipKey = useActivitiesOrderKey(interval, orderBy, expandedAll);

  useEffect(() => {
    innerRef.current!.style.minHeight = `${height}px`;
  }, [height]);

  const freezeClock = useClockStore((state) => state.freeze);
  const unfreezeClock = useClockStore((state) => state.unfreeze);

  return (
    <Flipper flipKey={flipKey} onStart={freezeClock} onComplete={unfreezeClock}>
      <ResizableList
        itemData={itemData}
        width={width}
        height={height}
        innerElementType={InnerElementType}
        innerRef={innerRef}
      />
    </Flipper>
  );
};

type InnerElementTypeProps = {
  children: ReactNode;
  style: { [key: string]: unknown };
  ref: Ref<HTMLDivElement>;
};

const InnerElementType = (props: InnerElementTypeProps) => {
  const { style, ref, ...rest } = props;
  return (
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
  );
};

const FILTER_PADDING_TOP = 16;

const useItemData = (props: Props) => {
  const { header, filter, interval, orderBy } = props;
  const expandedAll = useExpandedAll();
  const activities = useFilteredActivities(orderBy, interval, expandedAll);

  const theme = useTheme();
  const largeAppBar = useMediaQuery(theme.breakpoints.up("sm"));

  return useMemo(
    () =>
      [
        {
          RowComponent: Header,
          rowProps: { header, filter },
          rowData: {
            size:
              (filter ? filter.initialHeight + FILTER_PADDING_TOP : 0) +
              (largeAppBar ? 64 : 56),
          },
        } as SingleItemData<typeof Header>,
        ...activities.map(
          (activity) =>
            ({
              RowComponent: ActivityItem,
              rowProps: { activity, interval },
              rowData: { size: 92.03125 },
            }) as SingleItemData<typeof ActivityItem>,
        ),
      ] as SingleItemData<ElementType>[],
    [activities, filter, header, interval, largeAppBar],
  );
};

const useFilteredActivities = (
  orderBy: OrderBy,
  interval: ClosedInterval,
  expandedAll: Set<string>,
) => {
  const { data: activities = new Map<string, Activity>() } = useActivities();
  const time = useClockStore((state) => state.time);

  return useMemo(
    () =>
      getActivitiesByOrder(interval, expandedAll, orderBy, activities, time),
    [activities, expandedAll, interval, orderBy, time],
  );
};

type HeaderProps = Pick<Props, "header" | "filter">;

const Header = (props: HeaderProps) => {
  const { header, filter } = props;
  return (
    <>
      <AppAppBar header={header} actions={<AppBarActions />} />
      {filter && (
        <Grid
          container
          style={{ padding: FILTER_PADDING_TOP, paddingBottom: 0 }}
          justifyContent={"center"}
        >
          {filter?.element}
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
