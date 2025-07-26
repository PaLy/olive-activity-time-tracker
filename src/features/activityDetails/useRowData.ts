import { useMemo, ElementType } from "react";
import { SingleItemData } from "../../components/ResizableList";
import { ActivityDetailsData } from "../../db/queries/activityDetails";
import { TopOfIntervalList } from "./TopOfIntervalList";
import { SubheaderItem } from "./SubheaderItem";
import { IntervalItem } from "./IntervalItem";

export const useRowData = (
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
