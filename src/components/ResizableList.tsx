import {
  ListChildComponentProps,
  VariableSizeList,
  VariableSizeListProps,
} from "react-window";
import React, {
  ComponentProps,
  ComponentType,
  ElementType,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { ScrollMemoryContext } from "./ScrollMemory";
import { useLocation } from "../routes/Router";

type ResizableListProps<Component extends ElementType> = Pick<
  VariableSizeListProps<ItemData<Component>>,
  "height" | "width" | "onItemsRendered" | "innerElementType" | "innerRef"
> & {
  itemData: ItemData<Component>;
};

type ItemData<Component extends ElementType> = Array<{
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: number;
  };
}>;

export type SingleItemData<Component extends ElementType> = {
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: number;
  };
};

export const ResizableList = <Component extends ElementType>(
  props: ResizableListProps<Component>,
) => {
  const {
    height,
    width,
    itemData,
    onItemsRendered,
    innerElementType,
    innerRef,
  } = props;
  const variableSizeListRef =
    useRef<VariableSizeList<WrappedItemData<Component>>>(null);

  const computedRowHeights = useRef(new Map<number, number>());

  const wrappedItemData = useWrappedItemData(
    itemData,
    variableSizeListRef,
    computedRowHeights,
  );

  const { pathname: scrollID } = useLocation();
  const scrollMemory = useContext(ScrollMemoryContext);

  return (
    <VariableSizeList
      ref={variableSizeListRef}
      height={height}
      width={width}
      itemSize={(index) =>
        computedRowHeights.current.get(index) ?? itemData[index].rowData.size
      }
      itemCount={itemData.length}
      itemData={wrappedItemData}
      innerElementType={innerElementType}
      innerRef={innerRef}
      onItemsRendered={onItemsRendered}
      onScroll={(scrollProps) =>
        scrollMemory.set(scrollID, scrollProps.scrollOffset)
      }
      initialScrollOffset={scrollMemory.get(scrollID)}
      overscanCount={5}
    >
      {Row as RowType<Component>}
    </VariableSizeList>
  );
};

const useWrappedItemData = <Component extends ElementType>(
  itemData: ItemData<Component>,
  listRef: RefObject<VariableSizeList<WrappedItemData<Component>> | null>,
  computedRowHeights: React.MutableRefObject<Map<number, number>>,
) =>
  useMemo(
    () =>
      itemData.map((row) => ({
        ...row,
        rowData: {
          ...row.rowData,
          listRef,
          computedRowHeights,
        },
      })),
    [computedRowHeights, itemData, listRef],
  );

type WrappedItemData<Component extends ElementType> = Array<{
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: number;
    listRef: RefObject<VariableSizeList<WrappedItemData<Component>> | null>;
    computedRowHeights: React.MutableRefObject<Map<number, number>>;
  };
}>;

type RowType<Component extends ElementType> = ComponentType<
  ListChildComponentProps<WrappedItemData<Component>>
>;

const Row = <Component extends ElementType>(
  props: ListChildComponentProps<WrappedItemData<Component>>,
) => {
  const { index, style, data } = props;
  const {
    RowComponent,
    rowData: { size, listRef, computedRowHeights },
    rowProps,
  } = data[index];

  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rowHeight = computedRowHeights.current.get(index) ?? size;
    const componentHeight = rowRef.current?.getBoundingClientRect().height;

    if (rowHeight !== componentHeight) {
      if (componentHeight !== undefined) {
        computedRowHeights.current.set(index, componentHeight);
      } else {
        computedRowHeights.current.delete(index);
      }
      listRef.current?.resetAfterIndex(index);
    }
  });

  return (
    <div style={style}>
      <div ref={rowRef}>
        <RowComponent {...rowProps} />
      </div>
    </div>
  );
};
