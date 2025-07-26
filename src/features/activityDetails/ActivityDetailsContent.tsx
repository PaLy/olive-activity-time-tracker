import { useState, useMemo } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { ResizableList, SingleItemData } from "../../components/ResizableList";
import { ActivityDetailsData } from "../../db/queries/activityDetails";
import { useRowData } from "./useRowData";
import { InnerElementType, InnerElementTypeRef } from "./InnerElementType";
import { IntervalItem } from "./IntervalItem";

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
