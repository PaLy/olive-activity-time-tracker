import { useMemo, useState } from "react";
import { ResizableList, SingleRowData } from "../../components/ResizableList";
import { ActivityDetailsData } from "../../db/queries/activityDetails";
import { useRowData } from "./useRowData";
import { IntervalItem } from "./IntervalItem";
import { StickySubheader } from "./StickySubheader";

type ActivityDetailsContentProps = {
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

export const ActivityDetailsContent = (props: ActivityDetailsContentProps) => {
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
