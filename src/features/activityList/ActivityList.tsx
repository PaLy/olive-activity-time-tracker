import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";
import { AppAppBar } from "../../components/AppBar";
import { AppBottomNavigation } from "./BottomNavigation";
import { Flipper } from "react-flip-toolkit";
import { ElementType, ReactNode, useMemo } from "react";
import { useLocation, useNavigate } from "../../router/hooks";
import AddIcon from "@mui/icons-material/Add";
import { AddActivityModal } from "../addActivity/AddActivityModal";
import { ResizableList, SingleRowData } from "../../components/ResizableList";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ActivityTreeNode,
  getActivitiesTree,
} from "../../db/queries/activitiesTree";
import { OrderBy } from "./constants";
import { useFlipKey } from "./hooks";
import { SimpleInterval } from "../../utils/types";
import { useClockStore } from "../../utils/clock";
import { activityDuration } from "../activities/services";
import { useAppSnackbarStore } from "../../components/AppSnackbarStore";

export type ActivityListProps = {
  interval: SimpleInterval;
  header: string;
  filter?: ActivityListFilter;
  orderBy: OrderBy;
};

export type ActivityListFilter = {
  element: ReactNode;
  // needed to avoid activities jumping
  initialHeight: number;
};

const BOTTOM_NAVIGATION_HEIGHT = 56;

export const ActivityList = (props: ActivityListProps) => {
  return (
    <Grid container direction={"column"} height={"100%"}>
      <Paper
        square
        sx={{ height: `calc(100% - ${BOTTOM_NAVIGATION_HEIGHT}px)` }}
      >
        <List {...props} />
        <Box
          sx={{
            position: "absolute",
            bottom: 24 + BOTTOM_NAVIGATION_HEIGHT,
            right: 28,
          }}
        >
          <AddActivityOpener />
          <AddActivityModal />
        </Box>
      </Paper>
      <AppBottomNavigation />
    </Grid>
  );
};

const List = (props: ActivityListProps) => {
  const { ...otherProps } = props;
  const { interval, orderBy } = props;
  const activities = useFilteredActivities(orderBy, interval);
  const rowData = useRowData(otherProps, activities);
  const { flipKey } = useFlipKey(activities);

  const freezeClock = useClockStore((state) => state.freeze);
  const unfreezeClock = useClockStore((state) => state.unfreeze);

  return (
    <StyledFlipper
      flipKey={flipKey}
      onStart={freezeClock}
      onComplete={unfreezeClock}
    >
      <ResizableList
        defaultRowHeight={92}
        rowData={rowData}
        style={{ paddingBottom: "64px" }}
      />
    </StyledFlipper>
  );
};

const StyledFlipper = styled(Flipper)`
  height: 100%;
`;

const FILTER_PADDING_TOP = 16;

const useRowData = (
  props: ActivityListProps,
  activities: ActivityTreeNode[],
) => {
  const { header, filter, interval } = props;

  return useMemo(
    () =>
      [
        {
          RowComponent: Header,
          rowProps: { header, filter },
        } as SingleRowData<typeof Header>,
        ...activities.map(
          (activity) =>
            ({
              RowComponent: ActivityItem,
              rowProps: { activity, interval },
            }) as SingleRowData<typeof ActivityItem>,
        ),
      ] as SingleRowData<ElementType>[],
    [activities, filter, header, interval],
  );
};

const useFilteredActivities = (orderBy: OrderBy, interval: SimpleInterval) => {
  const activities = useLiveQuery(
    () =>
      getActivitiesTree(interval).catch((e) => {
        console.error(e);
        useAppSnackbarStore.getState().openError("Failed to load activities");
        return undefined;
      }),
    [interval],
  );
  const time = useClockStore((state) => state.time);

  return useMemo(
    () => getOrderedActivities(activities, orderBy, interval, +time),
    [activities, orderBy, time, interval],
  );
};

/**
 * Transforms activities tree into flat array in pre-ordered manner.
 * Children are ordered by the specified order.
 * If parent is collapsed, its children are not included.
 */
function getOrderedActivities(
  parent: ActivityTreeNode | undefined,
  orderBy: OrderBy,
  interval: SimpleInterval,
  time: number,
): ActivityTreeNode[] {
  if (!parent) return [];

  if (parent.id === -1 || parent.expanded) {
    const children = parent.children
      .toSorted(activitiesComparator(orderBy, interval, time))
      .flatMap((child) => getOrderedActivities(child, orderBy, interval, time));

    if (parent.id === -1) {
      return children;
    } else {
      return [parent].concat(children);
    }
  } else {
    return [parent];
  }
}

function activitiesComparator(
  orderBy: OrderBy,
  interval: SimpleInterval,
  time: number,
) {
  switch (orderBy) {
    // order by duration descending, then by last end time descending, then by name ascending
    case OrderBy.Duration:
      return (a: ActivityTreeNode, b: ActivityTreeNode) =>
        activityDuration(b, interval, time) -
          activityDuration(a, interval, time) ||
        b.subtreeLastEndTime - a.subtreeLastEndTime ||
        a.name.localeCompare(b.name);
    // order by last end time descending, then by duration descending, then by name ascending
    case OrderBy.LastEndTime:
      return (a: ActivityTreeNode, b: ActivityTreeNode) =>
        b.subtreeLastEndTime - a.subtreeLastEndTime ||
        activityDuration(b, interval, time) -
          activityDuration(a, interval, time) ||
        a.name.localeCompare(b.name);
  }
}

type HeaderProps = Pick<ActivityListProps, "header" | "filter">;

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
