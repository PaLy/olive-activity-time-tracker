import { signal, Signal, useComputed } from "@preact/signals-react";
import { Box, Fab, Grid, Paper } from "@mui/material";
import { AppBarActions } from "./AppBarActions";
import { ActivityItem } from "./ActivityItem";
import {
  useActivitiesByDurationPreorder,
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

type Props = {
  interval: Signal<ClosedInterval>;
  header: Signal<string>;
  filterComponent: Signal<ReactNode | undefined>;
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
  const { interval } = props;
  const itemData = useItemData(otherProps);
  const innerRef = useRef<HTMLDivElement>();
  const flipKey = useActivitiesOrderKey(interval);

  useEffect(() => {
    innerRef.current!.style.minHeight = `${height}px`;
  }, [height]);

  return (
    <Flipper flipKey={flipKey.value}>
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

const useItemData = (props: Props) => {
  const { header, filterComponent, interval } = props;
  const expandedAll = useExpandedAllSignal();
  const activities = useActivitiesByDurationPreorder(interval, expandedAll);
  return useComputed(
    () =>
      [
        {
          RowComponent: Header,
          rowProps: { header, filterComponent },
          rowData: { size: signal(120) },
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

type HeaderProps = Pick<Props, "header" | "filterComponent">;

const Header = (props: HeaderProps) => {
  const { header, filterComponent } = props;
  return (
    <>
      <AppAppBar header={header.value} actions={<AppBarActions />} />
      {filterComponent.value && (
        <Grid container sx={{ p: 2, pb: 0 }} justifyContent={"center"}>
          {filterComponent}
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
