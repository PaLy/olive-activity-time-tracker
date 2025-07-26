import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Link, Outlet, useParams } from "react-router";
import { FullScreenModalHeader } from "../../components/FullScreenModalHeader";
import {
  ElementType,
  ReactNode,
  Ref,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import EditIcon from "@mui/icons-material/Edit";
import { DeleteIntervalConfirmation } from "./DeleteIntervalConfirmation";
import { ActivityName } from "./ActivityName";
import AutoSizer from "react-virtualized-auto-sizer";
import { ResizableList, SingleItemData } from "../../components/ResizableList";
import { calendarTime, MAX_DATE_MS } from "../../utils/date";
import { openErrorSnackbar } from "../../components/AppSnackbarStore";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ActivityDetailsData,
  getActivityDetails,
} from "../../db/queries/activityDetails";
import moment from "moment";
import { Activity, Interval } from "../../db/entities";
import { useActivityFullName } from "./hooks";
import { useIntervalDuration } from "../intervals/hooks";
import {
  editActivityName,
  getSiblingActivities,
} from "../../db/queries/activities";

export const ActivityDetailsPage = () => {
  const params = useParams<{ activityID: string }>();
  // TODO validate activityID is a number
  const activityId = parseInt(params.activityID ?? "");
  const [editingState, setEditingState] = useState<{
    editMode: boolean;
    name: string;
    siblingNames: Set<string>;
    validationError: string;
  }>({
    editMode: false,
    name: "",
    siblingNames: new Set(),
    validationError: "",
  });

  const activityDetailsData = useLiveQuery(
    () =>
      getActivityDetails(activityId).catch((e) => {
        console.error(e);
        openErrorSnackbar("Activity not found");
        return undefined;
      }),
    [activityId],
  );

  const validateName = (nameToValidate: string, siblingNames: Set<string>) => {
    if (nameToValidate.trim() === "") {
      return "Activity name cannot be empty";
    }
    if (siblingNames.has(nameToValidate.trim().toLowerCase())) {
      return "An activity with this name already exists in the same parent";
    }
    return "";
  };

  const handleEditStart = async () => {
    if (!activityDetailsData) return;

    try {
      const siblings = await getSiblingActivities(activityId);
      const names = new Set(
        siblings.map((sibling) => sibling.name.toLowerCase()),
      );
      const currentActivity = activityDetailsData.activities.get(activityId);

      setEditingState({
        editMode: true,
        name: currentActivity?.name || "",
        siblingNames: names,
        validationError: "",
      });
    } catch (err) {
      console.error(err);
      openErrorSnackbar("Failed to load activity data");
    }
  };

  const handleNameChange = (newName: string) => {
    const validationError = validateName(newName, editingState.siblingNames);
    setEditingState((prev) => ({
      ...prev,
      name: newName,
      validationError,
    }));
  };

  const handleSave = () => {
    const trimmedName = editingState.name.trim();
    const validationError = validateName(
      trimmedName,
      editingState.siblingNames,
    );

    if (validationError) {
      setEditingState((prev) => ({ ...prev, validationError }));
      return;
    }

    editActivityName(activityId, trimmedName)
      .then(() => {
        setEditingState({
          editMode: false,
          name: "",
          siblingNames: new Set(),
          validationError: "",
        });
      })
      .catch((err) => {
        console.error(err);
        openErrorSnackbar("Failed to save activity name");
      });
  };

  const handleCancel = () => {
    setEditingState({
      editMode: false,
      name: "",
      siblingNames: new Set(),
      validationError: "",
    });
  };

  return (
    <>
      <Paper square sx={{ height: "100%" }}>
        {activityDetailsData ? (
          <Content
            activityDetails={activityDetailsData}
            editingState={editingState}
            onEditStart={handleEditStart}
            onNameChange={handleNameChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <Loading />
        )}
      </Paper>
      <Outlet />
      <DeleteIntervalConfirmation />
    </>
  );
};

type ContentProps = {
  activityDetails: ActivityDetailsData;
  editingState: {
    editMode: boolean;
    name: string;
    siblingNames: Set<string>;
    validationError: string;
  };
  onEditStart: () => void;
  onNameChange: (newName: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

const Content = (props: ContentProps) => {
  const {
    activityDetails,
    editingState,
    onEditStart,
    onNameChange,
    onSave,
    onCancel,
  } = props;
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const rowData = useRowData(
    activityDetails,
    visibleStartIndex,
    editingState,
    onEditStart,
    onNameChange,
    onSave,
    onCancel,
  );

  const topInterval = useMemo(() => {
    if (visibleStartIndex > 0) {
      return rowData
        .slice(visibleStartIndex)
        .find(
          (
            singleRowData,
          ): singleRowData is SingleItemData<typeof IntervalItem> =>
            singleRowData.RowComponent === IntervalItem,
        )?.rowProps.interval;
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
          innerElementType={InnerElementType}
          innerRef={(ref: InnerElementTypeRef | null) =>
            ref?.setTopInterval(topInterval)
          }
          onItemsRendered={({ visibleStartIndex }) => {
            setVisibleStartIndex(visibleStartIndex);
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

type InnerElementTypeRef = {
  setTopInterval: (topInterval: Interval | undefined) => void;
};

type InnerElementTypeProps = {
  children: ReactNode;
  style: { [key: string]: unknown };
  ref: Ref<InnerElementTypeRef>;
};

const InnerElementType = (props: InnerElementTypeProps) => {
  const { children, ref, ...rest } = props;
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
};

type StickySubheaderProps = {
  interval: Interval | undefined;
};

const StickySubheader = (props: StickySubheaderProps) => {
  const { interval } = props;
  return <>{interval && <SubheaderItem dayStart={interval.start} />}</>;
};

type TopOfIntervalListProps = {
  activityDetails: ActivityDetailsData;
  editingState: {
    editMode: boolean;
    name: string;
    siblingNames: Set<string>;
    validationError: string;
  };
  onEditStart: () => void;
  onNameChange: (newName: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

const TopOfIntervalList = (props: TopOfIntervalListProps) => {
  const {
    activityDetails,
    editingState,
    onEditStart,
    onNameChange,
    onSave,
    onCancel,
  } = props;
  const { id, activities } = activityDetails;

  return (
    <Box sx={{ pt: 1, pb: 1 }}>
      <FullScreenModalHeader headline="Activity details" />
      <ActivityName
        activityId={id}
        activities={activities}
        editMode={editingState.editMode}
        name={editingState.name}
        validationError={editingState.validationError}
        onEditStart={onEditStart}
        onNameChange={onNameChange}
        onSave={onSave}
        onCancel={onCancel}
      />
      <Typography variant="h6" sx={{ pl: 2, pr: 2 }}>
        Intervals
      </Typography>
    </Box>
  );
};

const useRowData = (
  activityDetails: ActivityDetailsData,
  visibleStartIndex: number,
  editingState: {
    editMode: boolean;
    name: string;
    siblingNames: Set<string>;
    validationError: string;
  },
  onEditStart: () => void,
  onNameChange: (newName: string) => void,
  onSave: () => void,
  onCancel: () => void,
) => {
  return useMemo(() => {
    const { intervalsByDay, activities } = activityDetails;
    let index = 1;
    return [
      {
        RowComponent: TopOfIntervalList,
        rowProps: {
          activityDetails,
          editingState,
          onEditStart,
          onNameChange,
          onSave,
          onCancel,
        },
        rowData: { size: 104 },
      },
      ...intervalsByDay.flatMap((dayIntervals) => {
        const { dayStart, intervals } = dayIntervals;
        const finalIndex = index;
        const subheaderData: SingleItemData<typeof SubheaderItem> = {
          RowComponent: SubheaderItem,
          rowProps: {
            dayStart,
            stickyItemVisible: visibleStartIndex === finalIndex,
          },
          rowData: { size: 48 },
        };
        const intervalsRowData: SingleItemData<typeof IntervalItem>[] =
          intervals.map((interval) => ({
            RowComponent: IntervalItem,
            rowProps: {
              interval,
              activities,
              activityId: activityDetails.id,
            },
            rowData: { size: 60.03125 },
          }));
        const items = [subheaderData, ...intervalsRowData];
        index += items.length;
        return items;
      }),
    ] as SingleItemData<ElementType>[];
  }, [
    activityDetails,
    visibleStartIndex,
    editingState,
    onEditStart,
    onNameChange,
    onSave,
    onCancel,
  ]);
};

type SubheaderItemProps = {
  dayStart: number;
  stickyItemVisible?: boolean;
};

const SubheaderItem = (props: SubheaderItemProps) => {
  const { dayStart, stickyItemVisible } = props;
  return (
    <ListSubheader style={{ opacity: stickyItemVisible ? 0 : 1 }}>
      {calendarTime(moment(dayStart))}
    </ListSubheader>
  );
};

type IntervalProps = {
  activityId: number;
  interval: Interval;
  activities: Map<number, Activity>;
};

const IntervalItem = (props: IntervalProps) => {
  const { activityId, interval, activities } = props;
  const { start, activityId: subActivityId } = interval;
  const duration = useIntervalDuration(interval.start, interval.end, false);

  const subActivityPath = useActivityFullName(
    subActivityId,
    activities,
    activityId,
  );
  const subActivitySuffix =
    activityId !== subActivityId ? ` (${subActivityPath})` : "";

  const startValue = moment(start).format(INTERVAL_FORMAT);
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
  if (end === MAX_DATE_MS) {
    return "now";
  } else if (moment(start).isSame(end, "day")) {
    return moment(end).format(INTERVAL_FORMAT);
  } else {
    return moment(end).format("ddd, MMM D, YYYY HH:mm");
  }
};
