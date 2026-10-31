import { useMemo, useState } from "react";
import { ResizableList, SingleRowData } from "../../components/ResizableList";
import { ActivityDetailsData } from "../../db/queries/activityDetails";
import { useRowData } from "./useRowData";
import { IntervalItem } from "./IntervalItem";
import { StickySubheader } from "./StickySubheader";
import { EditingState } from "./useActivityNameEditing";

type ActivityDetailsContentProps = {
  activityDetails: ActivityDetailsData;
  editingState: EditingState;
  onEditStart: () => void;
  onNameChange: (newName: string) => void;
  onParentChange: (parentId: number) => void;
  onSave: (latestName?: string) => void;
  onCancel: () => void;
};

export const ActivityDetailsContent = (props: ActivityDetailsContentProps) => {
  const {
    activityDetails,
    editingState,
    onEditStart,
    onNameChange,
    onParentChange,
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
    onParentChange,
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
          ): singleRowData is SingleRowData<typeof IntervalItem> =>
            singleRowData.RowComponent === IntervalItem,
        )?.rowProps.interval;
    } else {
      return undefined;
    }
  }, [rowData, visibleStartIndex]);

  return (
    <>
      <ResizableList
        defaultRowHeight={60}
        rowData={rowData}
        onRowsRendered={(visibleRows) => {
          setVisibleStartIndex(visibleRows.startIndex);
        }}
      >
        <StickySubheader interval={topInterval} />
      </ResizableList>
    </>
  );
};
